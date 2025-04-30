import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";

type Params = { id: string };

const getHandler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = parseInt(params.id, 10);
  if (isNaN(entityId)) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
  });

  if (!entity) {
    return NextResponse.json({ message: "Entity not found" }, { status: 404 });
  }

  return NextResponse.json(entity);
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
