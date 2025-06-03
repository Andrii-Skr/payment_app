import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

interface Body {
  template_id: number;
  is_deleted: boolean;
}

const handler = async (
  _req: NextRequest,
  body: Body,
  _params: {},
  _user: Session["user"] | null
) => {
  try {
    const { template_id, is_deleted } = body;

    await prisma.template.update({
      where: { id: template_id },
      data: { is_deleted },
    });

    return NextResponse.json({
      success: true,
      message: `Template ${is_deleted ? "deleted" : "restored"}.`,
    });
  } catch (e) {
    console.error("Template delete error:", e);
    return NextResponse.json(
      { success: false, message: "Failed to update deletion flag." },
      { status: 500 }
    );
  }
};

export const PATCH = apiRoute<Body>(handler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
