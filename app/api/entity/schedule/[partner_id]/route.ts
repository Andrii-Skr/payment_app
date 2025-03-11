import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { partner_id: string } }
) {
  const partnerId = parseInt(params.partner_id, 10);

  const documents = await prisma.documents.findMany({
    where: {
      partner_id: partnerId,
    },
    include: {
      spec_doc: true,
    },
  });

  return NextResponse.json(documents);
}
