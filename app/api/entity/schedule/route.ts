import prisma from "@/prisma/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  if (role === "admin") {
    // Admin получает всё
    const entities = await prisma.entity.findMany({
      where: { is_deleted: false },
      select: fullEntitySelect(),
    });
    return NextResponse.json(entities);
  }

  // Получаем связи
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      users_partners: true,
      users_entities: true,
    },
  });

  const partnerIds = user?.users_partners.map(p => p.partner_id) ?? [];
  const entityIds = user?.users_entities.map(e => e.entity_id) ?? [];

  // Если есть доступ по партнёрам — отдаём только связанные с ними документы
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

    // Отфильтровываем entity без документов (чтобы не было пустых блоков)
    const filtered = entities.filter(e => e.documents.length > 0);
    return NextResponse.json(filtered);
  }

  // Если партнёров нет, но есть entity-доступ
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

  // Нет доступа ни к чему
  return NextResponse.json([]);
}

function fullDocumentSelect() {
  return {
    id: true,
    entity_id: true,
    partner_id: true,
    account_number: true,
    account_sum: true,
    purpose_of_payment: true,
    bank_account: true,
    date: true,
    partners: true,
    spec_doc: true,
  };
}

function fullEntitySelect() {
  return {
    id: true,
    name: true,
    documents: {
      where: {
        is_paid: false,
        is_deleted: false,
      },
      select: fullDocumentSelect(),
    },
  };
}
