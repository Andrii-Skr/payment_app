// app/api/templates/[entity_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import type { Session } from "next-auth";

/** Преобразует строку в числовой ID либо возвращает null, если строка не число */
function toEntityId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

/** Загружает все шаблоны по entity_id */
async function fetchTemplates(entityId: number) {
  return prisma.template.findMany({
    where: { entity_id: entityId },
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

const handler = async (
  _req: NextRequest,
  _body: null,
  params: { id: string },
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = toEntityId(params.id);
  if (entityId === null) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  // ACL: обычные пользователи видят только шаблоны своих организаций
  if (!hasRole(user.role, [Roles.ADMIN, Roles.MANAGER])) {
    const belongs = await prisma.users_entities.count({
      where: { user_id: Number(user.id), entity_id: entityId },
    });
    if (belongs === 0) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const templates = await fetchTemplates(entityId);
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
