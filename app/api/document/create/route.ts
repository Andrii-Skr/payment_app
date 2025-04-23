import { partner_account_number } from '@prisma/client';
import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type Payment = {
  paySum: number;
  expectedDate?: string;
  deadLineDate?: string;
};

type CreateDocumentBody = {
  entity_id: number;
  partner_id: number;
  partner_account_number_id: number;
  accountNumber: string;
  date: string;
  accountSum: number;
  accountSumExpression: string;
  vatType: boolean;
  vatPercent: number;
  purposeOfPayment: string;
  payments: Payment[];
};

const handler = async (
  _req: NextRequest,
  body: CreateDocumentBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.documents.create({
    data: {
      entity_id: body.entity_id,
      partner_id: body.partner_id,
      account_number: body.accountNumber,
      date: new Date(body.date),
      account_sum: body.accountSum,
      account_sum_expression: body.accountSumExpression,
      partner_account_number_id: body.partner_account_number_id,
      vat_type: body.vatType,
      vat_percent: body.vatType ? body.vatPercent : 0,
      purpose_of_payment: body.purposeOfPayment,
      user_id: parseInt(user.id, 10),
      is_saved: true,
      spec_doc: {
        create: body.payments.map(({ paySum, expectedDate, deadLineDate }) => ({
          pay_sum: paySum,
          expected_date: expectedDate
            ? new Date(expectedDate)
            : !deadLineDate
            ? new Date(body.date)
            : null,
          dead_line_date: deadLineDate ? new Date(deadLineDate) : null,
        })),
      },
    },
  });

  return NextResponse.json(
    { success: true, message: "Document created successfully.", result },
    { status: 200 }
  );
};

export async function POST(req: NextRequest, context: any) {
  return apiRoute<CreateDocumentBody>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
