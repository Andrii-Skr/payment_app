import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const getHandler = async (
  req: NextRequest,
  _body: null,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const edrpou = searchParams.get("edrpou");
  const entity_id = Number(searchParams.get("entity_id")); // 👈 исправлено название

  if (!edrpou || !entity_id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const partner = await prisma.partners.findFirst({
    where: {
      edrpou,
      entities: {
        some: { entity_id },
      },
    },
    include: {
      partner_account_number: {
        where: {
          entities: {
            some: { entity_id },
          },
        },
        include: {
          entities: {
            where: { entity_id },
            select: {
              entity_id: true,
              partner_account_number_id: true,
              is_visible: true,
              is_default: true,
              is_deleted: true,
            },
          },
        },
      },
    },
  });

  if (!partner) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  return NextResponse.json({ found: true, partner }, { status: 200 });
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
