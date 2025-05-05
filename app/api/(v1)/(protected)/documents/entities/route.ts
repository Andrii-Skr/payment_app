import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";

/* ──────────────────────── Prisma helpers ──────────────────────── */

/** Фильтр для «активных» документов */
const UNPAID_DOC_WHERE = { is_paid: false, is_deleted: false } as const;

/** Общий SELECT/INCLUDE для сущностей */
const entityQuery = Prisma.validator<Prisma.entityFindManyArgs>()({
  select: {
    id: true,
    name: true,
    edrpou: true,
    bank_account: true,
    bank_name: true,
    mfo: true,
    documents: {
      where: UNPAID_DOC_WHERE,
      include: {
        partners: true,
        spec_doc: true,
        partner_account_number: {
          select: { bank_account: true, bank_name: true, mfo: true },
        },
      },
    },
  },
});
export type EntityWithAll = Prisma.entityGetPayload<typeof entityQuery>;

/* ──────────────────────── Utils ──────────────────────────────── */

/** Короткий alias для JSON-ответа */
const json = (data: unknown, init?: ResponseInit) =>
  NextResponse.json(data, init);

/** Единая функция чтения сущностей с учётом entityQuery */
const fetchEntities = (where: Prisma.entityWhereInput) =>
  prisma.entity.findMany({ ...entityQuery, where });

/* ──────────────────────── Handler ─────────────────────────────── */

const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  /* Авторизация */
  if (!user) return json({ message: "Unauthorized" }, { status: 401 });

  /* Надёжно приводим id к числу */
  const userId = Number(user.id);
  if (!Number.isFinite(userId))
    return json({ message: "Invalid user id" }, { status: 400 });

  try {
    /* ─────────────────────── ADMIN ─────────────────────── */
    if (hasRole(user.role, Roles.ADMIN)) {
      return json(await fetchEntities({ is_deleted: false }));
    }

    /* ──────────────── MANAGER / USER ───────────────────── */
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        users_partners: { select: { partner_id: true } },
        users_entities: { select: { entity_id: true } },
      },
    });
    if (!dbUser) return json({ message: "User not found" }, { status: 404 });

    const partnerIds = dbUser.users_partners.map((p) => p.partner_id);
    const entityIds = dbUser.users_entities.map((e) => e.entity_id);

    /* Нет привязок — пустой ответ */
    if (partnerIds.length === 0 && entityIds.length === 0) {
      return json([]);
    }

    const entities = await fetchEntities({
      is_deleted: false,
      OR: [
        { id: { in: entityIds } },
        {
          documents: {
            some: {
              partner_id: { in: partnerIds },
              ...UNPAID_DOC_WHERE,
            },
          },
        },
      ],
    });

    return json(entities);
  } catch (err) {
    // TODO: подключить Sentry / Datadog и т.д.
    console.error(err);
    return json({ message: "Internal Server Error" }, { status: 500 });
  }
};

/* ─────────────────────── export ──────────────────────────────── */

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
