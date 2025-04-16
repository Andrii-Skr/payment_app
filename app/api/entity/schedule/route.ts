import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { fullEntitySelect } from "@/prisma/data/entity";
import { fullDocumentSelect } from "@/prisma/data/documents";
import type { Session } from "next-auth";

const handler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(user.id);

  // 👑 Админ — получает все entity
  if (hasRole(user.role, Roles.ADMIN)) {
    const entities = await prisma.entity.findMany({
      where: { is_deleted: false },
      select: fullEntitySelect(),
    });
    return NextResponse.json(entities);
  }

  // 👤 Остальные — по доступным партнёрам / организациям
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_partners: true,
      users_entities: true,
    },
  });

  const partnerIds = dbUser?.users_partners.map((p) => p.partner_id) ?? [];
  const entityIds = dbUser?.users_entities.map((e) => e.entity_id) ?? [];

  if (partnerIds.length > 0) {
    const entities = await prisma.entity.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        name: true,
        documents: {
          where: {
            partner_id: { in: partnerIds },
            is_paid: false,
            is_deleted: false,
          },
          select: fullDocumentSelect(),
        },
      },
    });

    const filtered = entities.filter((e) => e.documents.length > 0);
    return NextResponse.json(filtered);
  }

  if (entityIds.length > 0) {
    const entities = await prisma.entity.findMany({
      where: {
        id: { in: entityIds },
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        documents: {
          where: {
            is_paid: false,
            is_deleted: false,
          },
          select: fullDocumentSelect(),
        },
      },
    });

    return NextResponse.json(entities);
  }

  return NextResponse.json([]);
};

// ✅ Совместимая сигнатура для Next.js 15.3.0
export async function GET(req: NextRequest, context: any) {
  return apiRoute<null, {}>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
  })(req, context);
}
