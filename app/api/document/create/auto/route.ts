import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const auto = await prisma.auto_payment.create({
      data: {
        documents_id: body.documents_id,
        pay_sum: body.paySum,
        expected_date: body.expectedDate,
        dead_line_date: body.deadLineDate,
      },
    });

    const document = await prisma.documents.update({
      where: { id: body.documents_id },
      data: { is_auto_payment: true },
    });

    return NextResponse.json(
      { success: true, message: "Data processed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
