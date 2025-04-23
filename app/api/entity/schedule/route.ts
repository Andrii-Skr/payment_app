
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";


const entityQuery = Prisma.validator<Prisma.entityFindManyArgs>()({
  select: {
    id: true,
    name: true,
    edrpou: true,
    bank_account: true,
    bank_name: true,
    mfo: true,
    documents: {
      where: { is_paid: false, is_deleted: false },
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

const getEntities = (where: Prisma.entityWhereInput) =>
  prisma.entity.findMany({
    where,
    ...entityQuery,
  });


const handler = async (
  req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  /* Безопасно приводим id к number */
  const userId = Number.parseInt(String(user.id), 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  try {
    /* ──────────────────────── Admin ──────────────────────── */
    if (hasRole(user.role, Roles.ADMIN)) {
      const entities = await getEntities({ is_deleted: false });
      return NextResponse.json(entities);
    }

    /* ─────────────── Пользователь/менеджер ──────────────── */
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        users_partners: true,
        users_entities: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const partnerIds = dbUser.users_partners.map((p) => p.partner_id);
    const entityIds  = dbUser.users_entities.map((e) => e.entity_id);

    /* Нет привязок — пустой ответ */
    if (partnerIds.length === 0 && entityIds.length === 0) {
      return NextResponse.json([]);
    }

    /* Общее условие: либо явное владение entity, либо документы с нужными партнёрами */
    const entities = await getEntities({
      is_deleted: false,
      OR: [
        { id: { in: entityIds } },
        {
          documents: {
            some: {
              partner_id: { in: partnerIds },
              is_paid: false,
              is_deleted: false,
            },
          },
        },
      ],
    });

    return NextResponse.json(entities);
  } catch (err) {
    // TODO: Подключите свой логгер (Sentry, Datadog, etc.)
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

/* ✅ Next.js 15.3-совместимый экспорт */
export async function GET(req: NextRequest, ctx: any) {
  return apiRoute<null, {}>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
  })(req, ctx);
}
