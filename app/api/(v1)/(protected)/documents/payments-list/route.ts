import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";
import {
  getDocumentsForEntity,
  getDocumentsForPartners,
  DocumentWithPartner,
} from "@/prisma/data/documents";

const getHandler = async (
  req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = Number(req.nextUrl.searchParams.get("id"));
  if (!entityId || isNaN(entityId)) {
    return NextResponse.json({ message: "Missing or invalid id" }, { status: 400 });
  }

  if (user.role === Roles.ADMIN) {
    const documents = await getDocumentsForEntity(entityId);
    return NextResponse.json(documents);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: Number(user.id) },
    include: {
      users_partners: { select: { partner_id: true, entity_id: true } },
      users_entities: { select: { entity_id: true } },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const partnerIds = dbUser.users_partners
    .filter((p) => p.entity_id === entityId)
    .map((p) => p.partner_id);
  const entityIds = dbUser.users_entities.map((e) => e.entity_id);

  let documents: DocumentWithPartner[] = [];

  if (partnerIds.length > 0) {
    documents = await getDocumentsForPartners(entityId, partnerIds);
  } else if (entityIds.includes(entityId)) {
    documents = await getDocumentsForEntity(entityId);
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(documents);
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
