import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sample = await prisma.template.create({
      data: {
        entity_id: body.entity_id,
        name: body.sample,
        partner_id: body.partner_id,
        partner_name: body.partnerName,
        edrpou: body.edrpou,
        account_number: body.accountNumber,
        date: new Date(body.date),
        account_sum: body.accountSum,
        account_sum_expression: body.accountSumExpression,
        bank_account: body.selectedAccount,
        mfo: body.mfo,
        purpose_of_payment: body.purposeOfPayment,
        note: body.note,
        user_id: 1,
      },
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
