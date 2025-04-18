import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";

type TemplateBody = {
  entity_id: number;
  sample: string;
  partner_id: number;
  partnerName: string;
  edrpou: string;
  accountNumber: string;
  vatPercent: number;
  vatType: boolean;
  date: string;
  accountSum: number;
  accountSumExpression: string;
  selectedAccount: string;
  mfo: string;
  purposeOfPayment: string;
  note: string;
};

const handler = async (
  _req: NextRequest,
  body: TemplateBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sample = await prisma.template.create({
    data: {
      entity_id: body.entity_id,
      name: body.sample,
      partner_id: body.partner_id,
      partner_name: body.partnerName,
      edrpou: body.edrpou,
      account_number: body.accountNumber,
      vat_percent: Number(body.vatPercent),
      vat_type: body.vatType,
      date: new Date(body.date),
      account_sum: body.accountSum,
      account_sum_expression: body.accountSumExpression,
      bank_account: body.selectedAccount,
      mfo: body.mfo,
      purpose_of_payment: body.purposeOfPayment,
      note: body.note,
      user_id: parseInt(user.id, 10),
    },
  });

  return NextResponse.json(
    { success: true, message: "Template created successfully.", sample },
    { status: 200 }
  );
};

// ✅ Совместимо с App Router (Next.js 15.3.0)
export async function POST(req: NextRequest, context: any) {
  return apiRoute<TemplateBody>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
