import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import { z } from "zod";

/* ─────────────── Типы ─────────────── */
type Params = { id: string };

const schema = z.object({
  full_name: z.string().min(1),
  short_name: z.string().min(1),
});
type Body = z.infer<typeof schema>;

/* ─────────────── GET ─────────────── */
const getHandler = async (
  req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(user.id);
  const role = user.role;
  const entityId = Number(params.id);
  if (isNaN(entityId))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  /* query-параметры */
  const url = new URL(req.url);
  const showDeleted = url.searchParams.get("showDeleted") === "true";
  const showHidden = url.searchParams.get("showHidden") === "true";

  /* фильтр по связующей таблице */
  const relationFilter = {
    entity_id: entityId,
    ...(showDeleted ? {} : { is_deleted: false }),
    ...(showHidden ? {} : { is_visible: true }),
  };

  /* общее include для партнёра */
  const include = {
    partner: {
      include: {
        partner_account_number: {
          where: {
            entities: {
              some: { entity_id: entityId },
            },
          },
          include: {
            entities: {
              where: { entity_id: entityId },
              select: {
                entity_id: true,
                partner_account_number_id: true,
                is_visible: true,
                is_default: true,
                is_deleted: true,
              },
            },
          },
        },
        entities: {
          where: { entity_id: entityId },
          select: {
            entity_id: true,
            partner_id: true,
            is_deleted: true,
            is_visible: true,
          },
        },
      },
    },
  };

  /* 👑 ADMIN: видит всё */
  if (hasRole(role, Roles.ADMIN)) {
    const relationRecords = await prisma.partners_on_entities.findMany({
      where: relationFilter,
      include,
    });
    const partners = relationRecords.map((r) => r.partner);
    return NextResponse.json(partners);
  }

  /* 👤 MANAGER: проверяем доступ */
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      users_partners: { select: { partner_id: true } },
      users_entities: { select: { entity_id: true } },
    },
  });
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const partnerIds = dbUser.users_partners.map((p) => p.partner_id);
  const entityIds = dbUser.users_entities.map((e) => e.entity_id);
  const hasEntityAccess = entityIds.includes(entityId);

  if (!hasEntityAccess && partnerIds.length === 0)
    return NextResponse.json([]);

  const linkedRecords = await prisma.partners_on_entities.findMany({
    where: {
      ...relationFilter,
      ...(!hasEntityAccess && partnerIds.length
        ? { partner_id: { in: partnerIds } }
        : {}),
    },
    include,
  });

  const partners = linkedRecords.map((r) => r.partner);
  return NextResponse.json(partners);
};

/* ─────────────── PATCH ─────────────── */
const patchHandler = async (_req: NextRequest, body: Body, params: Params) => {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const updated = await prisma.partners.update({
    where: { id },
    data: { full_name: body.full_name, short_name: body.short_name },
  });

  return NextResponse.json({ success: true, updated });
};

/* ─────────────── Экспорт ─────────────── */
export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const PATCH = apiRoute<Body, Params>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
