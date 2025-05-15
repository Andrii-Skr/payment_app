import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const accountId = body.id;

  await prisma.partner_account_number.update({
    where: { id: accountId },
    data: { is_deleted: true },
  });

  return NextResponse.json({ success: true });
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
