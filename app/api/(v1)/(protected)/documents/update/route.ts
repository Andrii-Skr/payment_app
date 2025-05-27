import { Roles } from "@/constants/roles";
import { getSafeDateForPrisma } from "@/lib/date/getSafeDateForPrisma";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

//PATCH handler
type UpdateDocumentBody = {
  doc_id: number;
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
  payments: {
    paySum: number;
    expectedDate: string;
    deadLineDate: string;
    isPaid: boolean;
    purposeOfPayment: string;
  }[];
};

const patchHandler = async (
  _req: NextRequest,
  body: UpdateDocumentBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsedDate = getSafeDateForPrisma(body.date);
  if (!parsedDate) {
    return NextResponse.json(
      { message: "Invalid date format" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.documents.update({
      where: { id: body.doc_id },
      data: {
        entity_id: body.entity_id,
        partner_id: body.partner_id,
        account_number: body.accountNumber,
        date: parsedDate,
        account_sum: body.accountSum,
        account_sum_expression: body.accountSumExpression,
        vat_type: body.vatType,
        vat_percent: body.vatType ? body.vatPercent : 0,
        partner_account_number_id: body.partner_account_number_id,
        purpose_of_payment: body.purposeOfPayment,
        user_id: parseInt(user.id, 10),
        is_saved: true,
        spec_doc: {
          deleteMany: {}, // удаляем старые
          create: body.payments.map(
            ({
              paySum,
              expectedDate,
              deadLineDate,
              isPaid,
              purposeOfPayment,
            }) => ({
              pay_sum: paySum,
              expected_date: expectedDate
                ? new Date(expectedDate)
                : !deadLineDate
                ? new Date()
                : null,
              dead_line_date: deadLineDate ? new Date(deadLineDate) : null,
              purpose_of_payment: purposeOfPayment ?? "",
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

export const PATCH = apiRoute<UpdateDocumentBody>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
