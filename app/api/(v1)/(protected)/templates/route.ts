import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import { getSafeDateForPrisma } from "@/lib/date/getSafeDateForPrisma";

export type TemplateBody = {
  id: number;
  entity_id: number;
  sample: string;
  partner_id: number;
  full_name: string;
  short_name: string;
  edrpou: string;
  accountNumber: string;
  vatPercent: number;
  vatType: boolean;
  date?: Date;
  accountSum: number;
  accountSumExpression: string;
  partner_account_number_id: number;
  purposeOfPayment: string;
  note: string;
};

const postHandler = async (
  _req: NextRequest,
  body: TemplateBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const where = {
    entity_id_name: {
      entity_id: body.entity_id,
      name: body.sample.trim(),
    },
  }; // композитный ключ либо уникальный индекс

  const data = {
    entity_id: body.entity_id,
    name: body.sample.trim(),
    partner_id: body.partner_id,
    full_name: body.full_name,
    short_name: body.short_name,
    edrpou: body.edrpou,
    account_number: body.accountNumber,
    account_sum: body.accountSum,
    account_sum_expression: body.accountSumExpression,
    vat_type: body.vatType,
    vat_percent: body.vatPercent,
    date: getSafeDateForPrisma(body.date) ?? null,
    partner_account_number_id: body.partner_account_number_id,
    purpose_of_payment: body.purposeOfPayment?.split("№")[0]?.trim() ?? "",
    note: body.note,
    user_id: Number(user.id),
  };

  try {
    const sample = await prisma.template.upsert({
      where,
      create: data,
      update: data,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          sample.created_at === sample.updated_at
            ? "Шаблон успешно создан."
            : "Шаблон успешно обновлен.",
        sample,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Template upsert error:", e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = apiRoute<TemplateBody>(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
