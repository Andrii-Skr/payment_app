import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";


type CreateEntityBody = {
  name: string;
  type: number;
  edrpou: string;
  bank_name: string;
  bank_account: string;
  mfo: string;
  is_deleted: boolean;
};

// 🔹 GET: Получение всех entities (с фильтрацией по роли)
const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(user.id);

  if (hasRole(user.role, Roles.ADMIN)) {
    const all = await prisma.entity.findMany();
    return NextResponse.json(all);
  }

  const userWithEntities = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_entities: {
        include: { entity: true },
      },
    },
  });

  const entities = userWithEntities?.users_entities.map((e) => e.entity) ?? [];
  return NextResponse.json(entities);
};

export async function GET(req: NextRequest, context: any) {
  return apiRoute<null, {}>(getHandler, {
    requireAuth: true,
  })(req, context);
}

// 🔹 POST: Создание entity (только для админа и менеджера)
const postHandler = async (
  _req: NextRequest,
  body: CreateEntityBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    return NextResponse.json(
      { message: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  const entity = await prisma.entity.create({ data: body });
  return NextResponse.json({ entity });
};

export async function POST(req: NextRequest, context: any ) {
  return apiRoute<CreateEntityBody, {}>(postHandler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
  })(req, context);
}
