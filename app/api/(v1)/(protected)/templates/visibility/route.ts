import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

/** PATCH /api/templates/visibility  { template_id, is_visible } */
interface Body {
  template_id: number;
  is_visible: boolean;
}

const handler = async (
  _req: NextRequest,
  body: Body,
  _params: {},
  _user: Session["user"] | null
) => {
  try {
    const { template_id, is_visible } = body;

    await prisma.template.update({
      where: { id: template_id },
      data: { is_visible },
    });

    return NextResponse.json({
      success: true,
      message: `Template ${is_visible ? "restored" : "hidden"}.`,
    });
  } catch (e) {
    console.error("Template visibility error:", e);
    return NextResponse.json(
      { success: false, message: "Failed to update visibility." },
      { status: 500 }
    );
  }
};

export const PATCH = apiRoute<Body>(handler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
