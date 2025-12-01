import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import { getSafeDateForPrisma } from "@/lib/date/getSafeDateForPrisma";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

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
  is_auto_purpose_of_payment: boolean;
  note?: string;
};

// POST handler
const postHandler = async (
  _req: NextRequest,
  body: CreateDocumentBody & { allowDuplicate?: boolean },
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsedDate = getSafeDateForPrisma(body.date);
  if (!parsedDate) {
    return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
  }
  // 🔍 Проверка на дубликат, если не явно разрешено
  if (!body.allowDuplicate) {
    const exists = await prisma.documents.findFirst({
      where: {
        entity_id: body.entity_id,
        partner_id: body.partner_id,
        account_number: body.accountNumber,
        date: parsedDate,
        is_deleted: false,
      },
    });

    if (exists) {
      const sameSum = Number(exists.account_sum) === Number(body.accountSum) && Number(body.accountSum) > 0;
      return NextResponse.json(
        {
          success: false,
          message: "Документ с такими данными уже существует.",
          ...(sameSum ? {} : { allowDuplicate: true }),
        },
        { status: 409 },
      );
    }
  }

  const result = await prisma.documents.create({
    data: {
      entity_id: body.entity_id,
      partner_id: body.partner_id,
      account_number: body.accountNumber,
      date: parsedDate,
      account_sum: body.accountSum,
      account_sum_expression: body.accountSumExpression,
      partner_account_number_id: body.partner_account_number_id,
      vat_type: body.vatType,
      vat_percent: body.vatType ? body.vatPercent : 0,
      purpose_of_payment: body.purposeOfPayment,
      user_id: parseInt(user.id, 10),
      is_auto_purpose_of_payment: body.is_auto_purpose_of_payment,
      is_saved: true,
      note: body.note,
      spec_doc: {
        create: body.payments.map(({ paySum, expectedDate, deadLineDate, purposeOfPayment }) => ({
          pay_sum: paySum,
          expected_date: expectedDate ? new Date(expectedDate) : !deadLineDate ? new Date() : null,
          dead_line_date: deadLineDate ? new Date(deadLineDate) : null,
          purpose_of_payment: purposeOfPayment ?? "",
        })),
      },
    },
  });

  return NextResponse.json({ success: true, message: "Document created successfully.", result }, { status: 200 });
};

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
  _params: Record<string, never>,
  user: Session["user"] | null,
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
