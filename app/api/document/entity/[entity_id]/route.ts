import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";

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
  const entityId = parseInt(params.entity_id, 10);

  const documents:DocumentWithPartner[] = await prisma.documents.findMany({
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
