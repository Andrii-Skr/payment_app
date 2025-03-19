import prisma from "@/prisma/prisma-client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { entity_id: string } }
) {
  const entityId = parseInt(params.entity_id, 10);

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  return NextResponse.json(entity);
}
