import { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

type Params = { id: string };

const getHandler = async (_req: NextRequest, _body: null, params: Params, user: Session["user"] | null) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = parseInt(params.id, 10);
  if (Number.isNaN(entityId)) {
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

const patchHandler = async (
  _req: NextRequest,
  body: { is_deleted: boolean },
  params: Params,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  if (!body || typeof body.is_deleted !== "boolean") {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  try {
    const entity = await prisma.entity.update({
      where: { id },
      data: { is_deleted: body.is_deleted },
    });

    return NextResponse.json(entity);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Entity not found" }, { status: 404 });
    }
    console.error("Entity update failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const PATCH = apiRoute<{ is_deleted: boolean }, Params>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
