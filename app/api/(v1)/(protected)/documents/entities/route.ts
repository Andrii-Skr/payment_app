/* ────────────── route.ts ────────────── */

import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";

/* ────────────── Prisma helpers ────────────── */

/** документы, которые считаем «неоплаченными»                   */
const UNPAID_DOC_WHERE = { is_paid: false, is_deleted: false } as const;

/** базовый запрос entity + все связи                             */
export const entityQuery = Prisma.validator<Prisma.entityFindManyArgs>()({
  select: {
    id: true,
    full_name: true,
    short_name: true,
    edrpou: true,
    bank_account: true,
    bank_name: true,
    mfo: true,
    sort_order: true,

    /* --- Документы --- */
    documents: {
     where: UNPAID_DOC_WHERE,
      include: {
        partner: true,
        spec_doc: true,
        partner_account_number: {
          select: { bank_account: true, bank_name: true, mfo: true },
        },
      },
    },

    /* --- Связи партнеров с entity --- */
    partners: {
      where: { is_visible: true, is_deleted: false },
      include: {
        partner: {
          select: {
            id: true,
            full_name: true,
            short_name: true,
            edrpou: true,
          },
        },
      },
    },
  },
});
export type EntityWithAll = Prisma.entityGetPayload<typeof entityQuery>;

/* ────────────── post-фильтр видимости партнёров ────────────── */
function filterDocsByVisibility(entities: EntityWithAll[]): EntityWithAll[] {
  return entities.map((e) => {
    // id партнёров, видимых именно ДЛЯ этой entity
    const visiblePartnerIds = new Set(
      e.partners.map((p) => p.partner_id),
    );

    return {
      ...e,
      documents: e.documents.filter((d) =>
        visiblePartnerIds.has(d.partner_id),
      ),
    };
  });
}

/* ────────────── удобная обёртка json ────────────── */
const json = (data: unknown, init?: ResponseInit) =>
  NextResponse.json(data, init);

/* ────────────── основной fetchEntities ────────────── */
const fetchEntities = async (where: Prisma.entityWhereInput) => {
  const raw = await prisma.entity.findMany({
    ...entityQuery,
    where,
    orderBy: { sort_order: "asc" },
  });

  return filterDocsByVisibility(raw);
};

/* ────────────── Handler ────────────── */
const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null,
) => {
  if (!user) return json({ message: "Unauthorized" }, { status: 401 });

  const userId = Number(user.id);
  if (!Number.isFinite(userId))
    return json({ message: "Invalid user id" }, { status: 400 });

  try {
    /* --- ADMIN видит всё --- */
    if (hasRole(user.role, Roles.ADMIN))
      return json(await fetchEntities({ is_deleted: false }));

    /* --- MANAGER: высчитываем доступы --- */
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        users_partners: { select: { partner_id: true, entity_id: true } },
        users_entities: { select: { entity_id: true } },
      },
    });
    if (!dbUser) return json({ message: "User not found" }, { status: 404 });

    const directEntityIds = dbUser.users_entities.map((e) => e.entity_id);
    const allVisibleEntityIds = [...new Set(directEntityIds)];

    if (allVisibleEntityIds.length === 0) return json([]);

    const entities = await fetchEntities({
      is_deleted: false,
      id: { in: allVisibleEntityIds },
    });

    const entityAccess = new Set(directEntityIds);
    const partnerAccess = dbUser.users_partners.reduce<Record<number, Set<number>>>(
      (acc, { entity_id, partner_id }) => {
        if (!acc[entity_id]) acc[entity_id] = new Set();
        acc[entity_id].add(partner_id);
        return acc;
      },
      {}
    );

    const filtered = entities.map((e) => {
      const allowedPartners = partnerAccess[e.id];
      const hasEntityAccess = entityAccess.has(e.id);

      if (hasEntityAccess && (!allowedPartners || allowedPartners.size === 0)) {
        return e;
      }

      const partnerSet = allowedPartners ?? new Set<number>();
      return {
        ...e,
        partners: e.partners.filter((p) => partnerSet.has(p.partner_id)),
        documents: e.documents.filter((d) => partnerSet.has(d.partner_id)),
      };
    });

    return json(filtered);
  } catch (err) {
    console.error(err);
    return json({ message: "Internal Server Error" }, { status: 500 });
  }
};

/* ────────────── Export ────────────── */
export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
