// app/api/templates/[entity_id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import type { Session } from "next-auth";

/* -------------------------------------------------------------------------- */
/*                                  helpers                                   */
/* -------------------------------------------------------------------------- */

/** Преобразует строку в числовой ID либо возвращает null, если строка не число */
function toEntityId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

/** Загружает шаблоны: менеджеры/админы видят все, обычные пользователи — только свои */
async function fetchTemplates(
  userId: number,
  role: Session["user"]["role"],
  entityId: number,
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

export type TemplateWithBankDetails = Awaited<
  ReturnType<typeof fetchTemplates>
>[number];

/* -------------------------------------------------------------------------- */
/*                                  handler                                   */
/* -------------------------------------------------------------------------- */

const handler = async (
  _req: NextRequest,
  _body: null,
  { entity_id }: { entity_id: string },
  user: Session["user"] | null,
) => {
  /* -------------------------- basic auth checks -------------------------- */
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = toEntityId(entity_id);
  if (entityId === null) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  /* --- ACL: обычные пользователи видят только свои организации --- */
  if (!hasRole(user.role, [Roles.ADMIN, Roles.MANAGER])) {
    const belongs = await prisma.users_entities.count({
      where: { user_id: Number(user.id), entity_id: entityId },
    });
    if (belongs === 0) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  /* --------------------------- main business ---------------------------- */
  try {
    const templates = await fetchTemplates(Number(user.id), user.role, entityId);
    return NextResponse.json(templates);
  } catch (e) {
    console.error("Template fetch error:", e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                                   route                                    */
/* -------------------------------------------------------------------------- */

export const GET = apiRoute<null, { entity_id: string }>(handler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
});
