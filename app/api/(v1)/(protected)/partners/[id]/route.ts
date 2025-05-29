import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import { z } from "zod";

type Params = { id: string };

// ---------- GET ----------
const getHandler = async (
  req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(user.id);
  const role = user.role;
  const entityId = parseInt(params.id, 10);

  if (isNaN(entityId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const url = new URL(req.url);

  // ✅ читаем query-параметры
  const showDeleted = url.searchParams.get("showDeleted") === "true";
  const showHidden = url.searchParams.get("showHidden") === "true";

  const baseFilter = {
    ...(showDeleted ? {} : { is_deleted: false }),
    ...(showHidden ? {} : { is_visible: true }),
  };

  // 👑 Админ → доступ ко всем
  if (hasRole(role, "admin")) {
    const partners = await prisma.partners.findMany({
      where: {
        ...baseFilter,
        entities: {
          some: {
            entity_id: entityId,
          },
        },
      },
      include: { partner_account_number: true },
    });
    return NextResponse.json(partners);
  }

  // 👤 Остальные → проверка users_partners и users_entities
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      users_partners: { select: { partner_id: true } },
      users_entities: { select: { entity_id: true } },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const entityIds = dbUser.users_entities.map((e) => e.entity_id);
  const partnerIds = dbUser.users_partners.map((p) => p.partner_id);
  const hasEntityAccess = entityIds.includes(entityId);

  if (!hasEntityAccess && partnerIds.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const linkedPartnerIds = await prisma.partners_on_entities.findMany({
    where: {
      entity_id: entityId,
      partner_id: partnerIds.length > 0 ? { in: partnerIds } : undefined,
    },
    select: { partner_id: true },
  });

  const visiblePartnerIds = hasEntityAccess
    ? linkedPartnerIds.map((p) => p.partner_id)
    : [];

  if (!hasEntityAccess && visiblePartnerIds.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const partners = await prisma.partners.findMany({
    where: {
      ...baseFilter,
      id: { in: visiblePartnerIds },
      entities: {
        some: {
          entity_id: entityId,
        },
      },
    },
    include: { partner_account_number: true },
  });

  return NextResponse.json(partners);
};
//----------------------------------------------------------------------------------------------
const schema = z.object({
  full_name: z.string().min(1),
  short_name: z.string().min(1),
});

type Body = z.infer<typeof schema>;

const patchHandler = async (_req: NextRequest, body: Body, params: Params) => {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const updated = await prisma.partners.update({
    where: { id },
    data: {
      full_name: body.full_name,
      short_name: body.short_name,
    },
  });

  return NextResponse.json({ success: true, updated });
};

export const PATCH = apiRoute<Body, Params>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
