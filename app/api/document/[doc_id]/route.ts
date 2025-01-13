
import prisma from "@/prisma/prisma-client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { doc_id: string } }) {
  const docId = parseInt(params.doc_id, 10);

  const document = await prisma.documents.findUnique({
    where: {
      id: docId,
    },
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

  return NextResponse.json(document)
}

