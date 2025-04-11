import prisma from "@/prisma/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  if (role === "admin") {
    const all = await prisma.entity.findMany();
    return NextResponse.json(all);
  }

  // Не admin → только доступные entity
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
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const entity = await prisma.entity.create({ data });
  return NextResponse.json({
    entity,
  });
}
