import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";
import { getSafeDateForPrisma } from "@/lib/date/getSafeDateForPrisma";

type Payment = {
  paySum: number;
  expectedDate?: string;
  deadLineDate?: string;
  purposeOfPayment: string;
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

// POST handler
const postHandler = async (
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
      date: getSafeDateForPrisma(body.date),
      account_sum: body.accountSum,
      account_sum_expression: body.accountSumExpression,
      partner_account_number_id: body.partner_account_number_id,
      vat_type: body.vatType,
      vat_percent: body.vatType ? body.vatPercent : 0,
      purpose_of_payment: body.purposeOfPayment,
      user_id: parseInt(user.id, 10),
      is_saved: true,
      spec_doc: {
        create: body.payments.map(
          ({ paySum, expectedDate, deadLineDate, purposeOfPayment }) => ({
            pay_sum: paySum,
            expected_date: expectedDate
              ? new Date(expectedDate)
              : !deadLineDate
              ? new Date()
              : null,
            dead_line_date: deadLineDate ? new Date(deadLineDate) : null,
            purpose_of_payment: purposeOfPayment ?? "",
          })
        ),
      },
    },
  });

  return NextResponse.json(
    { success: true, message: "Document created successfully.", result },
    { status: 200 }
  );
};

// GET handler (example)
export type DocumentWithRelations = Prisma.documentsGetPayload<{
  include: {
    spec_doc: true;
    partner: {
      select: {
        short_name: true;
        full_name: true;
        edrpou: true;
      };
    };
  };
}>;

const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const documents: DocumentWithRelations[] = await prisma.documents.findMany({
    include: {
      spec_doc: true,
      partner: {
        select: {
          short_name: true,
          full_name: true,
          edrpou: true,
        },
      },
    },
  });

  return NextResponse.json(documents);
};

export const POST = apiRoute<CreateDocumentBody>(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
