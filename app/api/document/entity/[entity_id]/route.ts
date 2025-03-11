
import prisma from "@/prisma/prisma-client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { entity_id: string } }) {
  const entityId = parseInt(params.entity_id, 10);

  const documents = await prisma.documents.findMany(
    {
      where: {
        entity_id: entityId,
        is_saved: true,
        is_deleted: false,
        is_paid: false
      }, orderBy: { date: 'desc' }
    });
  return NextResponse.json(documents)
}

