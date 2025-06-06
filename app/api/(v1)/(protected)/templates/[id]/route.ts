// File: app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                             Re‑export type for FE                          */
export type TemplateWithBankDetails = Prisma.templateGetPayload<{
  include: {
    partner_account_number: {
      select: { bank_account: true; bank_name: true; mfo: true };
    };
  };
}>;

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
const toId = (raw: string): number | null =>
  /^\d+$/.test(raw) ? Number(raw) : null;
const yes = (v: string | null) => v === "1" || v === "true";

/* -------------------------------------------------------------------------- */
/*                                  Handler                                   */
const getHandler = async (
  req: NextRequest,
  _body: null,
  params: { id: string },
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = toId(params.id);
  if (entityId === null) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  /* -------------- ACL: users can access only their entities -------------- */
  if (!hasRole(user.role, [Roles.ADMIN, Roles.MANAGER])) {
    const belongs = await prisma.users_entities.count({
      where: { user_id: Number(user.id), entity_id: entityId },
    });
    if (belongs === 0) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const sp = req.nextUrl.searchParams;
    const showDeleted = yes(sp.get("showDeleted"));
    const showHidden = yes(sp.get("showHidden"));

    const templates = await prisma.template.findMany({
      where: {
        entity_id: entityId,
        ...(showDeleted ? {} : { is_deleted: false }),
        ...(showHidden ? {} : { is_visible: true }),
      },
      orderBy: { date: "desc" },
      include: {
        partner_account_number: {
          select: { bank_account: true, bank_name: true, mfo: true },
        },
      },
    });

    return NextResponse.json(templates);
  } catch (e) {
    console.error("Template fetch error:", e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

type PatchBody = {
  entity_id: number;
  sample: string;
  partner_id: number;
  full_name: string;
  short_name: string;
  edrpou: string;
  accountNumber: string;
  vatPercent: number;
  vatType: boolean;
  date: string | null;
  accountSum?: number;
  accountSumExpression: string;
  partner_account_number_id: number;
  purposeOfPayment?: string;
  note?: string;
};

const patchHandler = async (
  _req: NextRequest,
  body: PatchBody,
  params: { id: string },
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const updated = await prisma.template.update({
    where: { id: Number(params.id) },
    data: {
      entity_id: body.entity_id,
      name: body.sample,
      partner_id: body.partner_id,
      full_name: body.full_name,
      short_name: body.short_name,
      edrpou: body.edrpou,
      account_number: body.accountNumber,
      vat_percent: body.vatPercent,
      vat_type: body.vatType,
      date: body.date ? new Date(body.date) : null,
      account_sum: body.accountSum ? body.accountSum : 0,
      account_sum_expression: body.accountSumExpression,
      partner_account_number_id: body.partner_account_number_id,
      purpose_of_payment: body.purposeOfPayment,
      note: body.note,
    },
  });

  return NextResponse.json(
    { success: true, message: "Template updated.", template: updated },
    { status: 200 }
  );
};

export const PATCH = apiRoute<PatchBody, { id: string }>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const GET = apiRoute<null, { id: string }>(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
