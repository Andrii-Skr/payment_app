import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

/* ─────────────── Тип запроса ─────────────── */

const getHandler = async (
  req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const partnerId = Number(searchParams.get("partner_id"));
  const entityId = Number(searchParams.get("entity_id"));

  if (!partnerId || !entityId) {
    return NextResponse.json(
      { message: "Both partner_id and entity_id are required" },
      { status: 400 }
    );
  }

  /* ─────────────── ADMIN: полные права ─────────────── */
  if (user.role === Roles.ADMIN) {
    const documents = await prisma.documents.findMany({
      where: {
        partner_id: partnerId,
        entity_id: entityId,
        is_deleted: false,
      },
      include: {
        spec_doc: true,
      },
    });

    return NextResponse.json(documents);
  }

  /* ─────────────── MANAGER / USER: проверка доступа ─────────────── */
  const userId = Number(user.id);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      users_partners: { select: { partner_id: true } },
      users_entities: { select: { entity_id: true } },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const allowedPartnerIds = dbUser.users_partners.map((p) => p.partner_id);
  const allowedEntityIds = dbUser.users_entities.map((e) => e.entity_id);

  // Партнёр связан с entity через partners_on_entities?
  const linked = await prisma.partners_on_entities.findFirst({
    where: {
      partner_id: partnerId,
      entity_id: entityId,
    },
    select: { entity_id: true },
  });

  const hasAccess =
    allowedPartnerIds.includes(partnerId) ||
    allowedEntityIds.includes(entityId) ||
    linked !== null;

  if (!hasAccess) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const documents = await prisma.documents.findMany({
    where: {
      partner_id: partnerId,
      entity_id: entityId,
      is_deleted: false,
    },
    include: {
      spec_doc: true,
    },
  });

  return NextResponse.json(documents);
};

/* ─────────────── Экспорт ─────────────── */

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
