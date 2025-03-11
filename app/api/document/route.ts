import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export type DocumentWithRelations = Prisma.documentsGetPayload<{
  include: {
    spec_doc: true;
    partners: {
      select: {
        name: true;
        edrpou: true;
      };
    };
  };
}>;

export async function GET(
  req: NextRequest
): Promise<NextResponse<DocumentWithRelations[]>> {
  const document: DocumentWithRelations[] = await prisma.documents.findMany({
    include: {
      spec_doc: true,
      partners: {
        select: {
          name: true,
          edrpou: true,
        },
      },
    },
  });

  return NextResponse.json(document);
}
