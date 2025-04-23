// app/api/templates/[entity_id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import type { Session } from "next-auth";

/* -------------------------------------------------------------------------- */
/*                                  helpers                                   */
/* -------------------------------------------------------------------------- */

function toEntityId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

async function fetchTemplates(
  userId: number,
  role: Session["user"]["role"],
  entityId: number
) {
  const isPrivileged = hasRole(role, [Roles.ADMIN, Roles.MANAGER]);

  return prisma.template.findMany({
    where: {
      entity_id: entityId,
      ...(isPrivileged ? {} : { user_id: userId }),
    },
    orderBy: { date: "desc" },
    include: {
      partner_account_number: {
        select: { bank_account: true, bank_name: true, mfo: true },
      },
    },
  });
}

export type TemplateWithBankDetails = Awaited<ReturnType<typeof fetchTemplates>>[number];

/* -------------------------------------------------------------------------- */
/*                                   handler                                  */
/* -------------------------------------------------------------------------- */

const handler = async (
  _req: NextRequest,
  _body: null,
  params: { entity_id: string },
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = toEntityId(params.entity_id);
  if (entityId === null) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  /* -------- проверка принадлежности к entity через users_entities -------- */
  if (!hasRole(user.role, [Roles.ADMIN, Roles.MANAGER])) {
    const belongs = await prisma.users_entities.count({
      where: { user_id: Number(user.id), entity_id: entityId },
    });
    if (belongs === 0) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const templates = await fetchTemplates(Number(user.id), user.role, entityId);
    return NextResponse.json(templates);
  } catch (e) {
    console.error("Template fetch error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

/* -------------------------------------------------------------------------- */
/*                                    route                                   */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity_id: string }> }
) {
  return apiRoute<null, { entity_id: string }>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
  })(req, { params: await params });
}
