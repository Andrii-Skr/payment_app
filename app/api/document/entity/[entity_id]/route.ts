import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export type DocumentWithPartner = Prisma.documentsGetPayload<{
  include: {
    partners: {
      select: {
        name: true;
      };
    };
  };
}>;

export async function GET(
  req: NextRequest,
  { params }: { params: { entity_id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const role = session.user.role;
  const entityId = parseInt(params.entity_id, 10);

  // Admin — доступ ко всем документам entity
  if (role === "admin") {
    const documents: DocumentWithPartner[] = await prisma.documents.findMany({
      where: {
        entity_id: entityId,
        is_saved: true,
        is_deleted: false,
        is_paid: false,
      },
      include: {
        partners: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(documents);
  }

  // Обычный пользователь — проверяем доступ
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_partners: {
        include: {
          partners: true,
        },
      },
      users_entities: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const partnerIds = user.users_partners.map((up) => up.partner_id);
  const entityIds = user.users_entities.map((ue) => ue.entity_id);

  // Если есть users_partners → отдаём документы только этих партнёров (и entity должна совпадать)
  if (partnerIds.length > 0) {
    const documents: DocumentWithPartner[] = await prisma.documents.findMany({
      where: {
        entity_id: entityId,
        partner_id: { in: partnerIds },
        is_saved: true,
        is_deleted: false,
        is_paid: false,
      },
      include: {
        partners: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(documents);
  }

  // Если partner-доступа нет, но есть доступ к самой entity — отдаём все документы
  if (entityIds.includes(entityId)) {
    const documents: DocumentWithPartner[] = await prisma.documents.findMany({
      where: {
        entity_id: entityId,
        is_saved: true,
        is_deleted: false,
        is_paid: false,
      },
      include: {
        partners: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(documents);
  }

  // Нет доступа ни к партнёрам, ни к entity
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
