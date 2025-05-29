import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
  is_deleted: z.boolean(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const { id, is_deleted } = body;

  const updated = await prisma.partner_account_number.update({
    where: { id },
    data: { is_deleted },
  });

  return NextResponse.json({ success: true, updated });
};
export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
