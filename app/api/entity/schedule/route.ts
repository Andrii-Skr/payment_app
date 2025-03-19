import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const entity = await prisma.entity.findMany({
    where: {
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      documents: {
        where: {
          // is_saved: true,
          is_paid: false,
          is_deleted: false,
        },
        select: {
          id: true,
          partner_id: true,
          account_number: true,
          account_sum: true,
          note: true,
          bank_account: true,
          date: true,
          partners: true,
          spec_doc: true,
        },
      },
    },
  });
  return NextResponse.json(entity);
}
