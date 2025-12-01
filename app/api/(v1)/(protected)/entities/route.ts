import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

export type CreateEntityBody = Prisma.entityUncheckedCreateInput;

// 🔹 GET: Получение всех entities (с фильтрацией по роли)
const getHandler = async (
  req: NextRequest,
  _body: null,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(user.id);
  const showDeleted = req.nextUrl.searchParams.get("withDeleted") === "true";

  if (hasRole(user.role, Roles.ADMIN)) {
    const entities = await prisma.entity.findMany({
      where: showDeleted ? {} : { is_deleted: false },
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json(entities);
  }

  const userWithEntities = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_entities: {
        where: {
          entity: {
            is_deleted: false,
          },
        },
        include: {
          entity: true,
        },
      },
    },
  });

  const entities =
    userWithEntities?.users_entities.map((e) => e.entity).sort((a, b) => a.sort_order - b.sort_order) ?? [];
  return NextResponse.json(entities);
};

const postHandler = async (
  _req: NextRequest,
  body: CreateEntityBody,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
  }

  const entity = await prisma.entity.create({ data: body });
  return NextResponse.json({ entity });
};

const patchHandler = async (
  _req: NextRequest,
  body: CreateEntityBody,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = body;
  if (!id || typeof id !== "number") {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const entity = await prisma.entity.update({
      where: { id: id },
      data: body,
    });

    return NextResponse.json(entity);
  } catch (_error) {
    return NextResponse.json({ message: "Entity not found" }, { status: 404 });
  }
};

export const PATCH = apiRoute<CreateEntityBody>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN],
});

export const POST = apiRoute<CreateEntityBody>(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
