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
const toId = (raw: string): number | null => (/^\d+$/.test(raw) ? Number(raw) : null);
const yes = (v: string | null) => v === "1" || v === "true";

/* -------------------------------------------------------------------------- */
/*                                  Handler                                   */
const handler = async (
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

export const GET = apiRoute<null, { id: string }>(handler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
});
