import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  user_id: z.number(),
  is_deleted: z.boolean(),
});

type Body = z.infer<typeof schema>;

const patchHandler = async (_req: NextRequest, body: Body) => {
  await prisma.user.update({
    where: { id: body.user_id },
    data: { is_deleted: body.is_deleted },
  });

  return NextResponse.json({ success: true });
};

export const PATCH = apiRoute<Body>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
