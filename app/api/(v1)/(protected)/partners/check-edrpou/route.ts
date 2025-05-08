import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_req.url);

  const edrpou = searchParams.get("edrpou");
  const entity_id = searchParams.get("id");

  if (!edrpou || !entity_id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const partner = await prisma.partners.findFirst({
    where: {
      edrpou,
      entity_id: Number(entity_id),
    },
  });

  if (!partner) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(partner);
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
