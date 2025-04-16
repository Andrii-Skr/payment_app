import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import type { Session } from "next-auth";

type Params = { doc_id: string };

const handler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  _user: Session["user"] | null
) => {
  const docId = parseInt(params.doc_id, 10);

  if (isNaN(docId)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
  }

  const document = await prisma.documents.findUnique({
    where: { id: docId },
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

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  return apiRoute<null, Params>(handler)(req, context);
}
