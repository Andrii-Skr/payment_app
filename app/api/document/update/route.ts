import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";

type UpdateDocumentBody = {
  doc_id: number;
  entity_id: number;
  partner_id: number;
  accountNumber: string;
  date: string;
  accountSum: number;
  accountSumExpression: string;
  selectedAccount: string;
  mfo: string;
  purposeOfPayment: string;
  payments: {
    paySum: number;
    expectedDate: string;
    deadLineDate: string;
    isPaid: boolean;
  }[];
};

const handler = async (
  _req: NextRequest,
  body: UpdateDocumentBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.documents.update({
      where: { id: body.doc_id },
      data: {
        entity_id: body.entity_id,
        partner_id: body.partner_id,
        account_number: body.accountNumber,
        date: new Date(body.date),
        account_sum: body.accountSum,
        account_sum_expression: body.accountSumExpression,
        bank_account: body.selectedAccount,
        mfo: body.mfo,
        purpose_of_payment: body.purposeOfPayment,
        user_id: parseInt(user.id, 10),
        is_saved: true,
        spec_doc: {
          deleteMany: {}, // удаляем старые
          create: body.payments.map(
            ({ paySum, expectedDate, deadLineDate, isPaid }) => ({
              pay_sum: paySum,
              expected_date: expectedDate
                ? new Date(expectedDate)
                : !deadLineDate
                ? new Date(body.date)
                : null,
              dead_line_date: deadLineDate ? new Date(deadLineDate) : null,
              is_paid: isPaid,
            })
          ),
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Data processed successfully.", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
};

// ✅ Правильный экспорт с учётом Next.js 15.3.0
export async function POST(req: NextRequest, context: any) {
  return apiRoute<UpdateDocumentBody>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
