import prisma from "@/prisma/prisma-client";
import { template } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { entity_id: string } }
) {
  const entityId = parseInt(params.entity_id, 10);


  const response = await prisma.template.findMany({
    where: {
      entity_id: entityId,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(response);
}
