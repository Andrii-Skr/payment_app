import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  user_id: z.number(),
  password: z.string().min(6),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const hashed = await bcrypt.hash(body.password, 10);
  await prisma.user.update({
    where: { id: body.user_id },
    data: { password: hashed },
  });
  return NextResponse.json({ success: true });
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
