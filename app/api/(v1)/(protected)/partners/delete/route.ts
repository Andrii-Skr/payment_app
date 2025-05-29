import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
  is_deleted: z.boolean(),
});

type Body = z.infer<typeof schema>;

const patchHandler = async (
  _req: NextRequest,
  body: Body,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await prisma.partners.update({
      where: { id: body.id },
      data: { is_deleted: body.is_deleted },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Ошибка при обновлении поля is_deleted у партнёра:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const PATCH = apiRoute<Body>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN],
});
