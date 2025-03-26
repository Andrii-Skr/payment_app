import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const updatedRecords = await prisma.spec_doc.updateMany({
    where: {
      id: { in: body.specDocIds },
    },
    data: {
      is_paid: true,
      paid_date: new Date(),
    },
  });

  return NextResponse.json(
    { success: true, message: "Data updated successfully." },
    { status: 200 }
  );
}
