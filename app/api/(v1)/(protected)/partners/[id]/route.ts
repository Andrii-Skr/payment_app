import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";

type Params = { id: string };

// ---------- GET ----------
const getHandler = async (
  _req: NextRequest,
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

  // 👑 Админ → доступ ко всем
  if (hasRole(role, "admin")) {
    const partners = await prisma.partners.findMany({
      where: { entity_id: entityId },
      include: { partner_account_number: true },
    });
    return NextResponse.json(partners);
  }

  // 👤 Остальные → проверка users_partners и users_entities
  const userWithRelations = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_partners: {
        include: { partners: true },
      },
      users_entities: true,
    },
  });

  if (!userWithRelations) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const entityAccess = userWithRelations.users_entities.some(
    (e) => e.entity_id === entityId
  );

  if (entityAccess) {
    const partners = await prisma.partners.findMany({
      where: { entity_id: entityId },
      include: { partner_account_number: true },
    });
    return NextResponse.json(partners);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
};

// ---------- POST ----------
const postHandler = async (
  _req: NextRequest,
  body: any,
  _params: {},
  _user: Session["user"] | null
) => {
  const entity = await prisma.entity.create({ data: body });
  return NextResponse.json({ entity });
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const POST = apiRoute(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
