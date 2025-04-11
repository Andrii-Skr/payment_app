import prisma from "@/prisma/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const role = session.user.role;
    const entityId = parseInt(params.id);

    if (isNaN(entityId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Admin → доступ ко всем
    if (role === "admin") {
      const partners = await prisma.partners.findMany({
        where: { entity_id: entityId },
        include: { partner_account_number: true },
      });
      return NextResponse.json(partners);
    }

    // Обычный пользователь → проверка users_partners и users_entities
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        users_partners: {
          include: { partners: true },
        },
        users_entities: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const entityAccess = user.users_entities.some(e => e.entity_id === entityId);
    const partnerIdsForEntity = user.users_partners
      .filter(up => up.partners.entity_id === entityId)
      .map(up => up.partner_id);

    // Если есть partner-доступ → только к ним
    if (partnerIdsForEntity.length > 0) {
      const partners = await prisma.partners.findMany({
        where: {
          id: { in: partnerIdsForEntity },
        },
        include: { partner_account_number: true },
      });
      return NextResponse.json(partners);
    }

    // Если есть доступ к entity, но нет указанных партнёров → отдать всех партнёров этой entity
    if (entityAccess) {
      const partners = await prisma.partners.findMany({
        where: { entity_id: entityId },
        include: { partner_account_number: true },
      });
      return NextResponse.json(partners);
    }

    // Нет доступа ни к entity, ни к партнёрам
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(req:NextRequest) {
    const data = await req.json()
    const entity = await prisma.entity.create({data})
    return NextResponse.json({
        entity,
    })
}
