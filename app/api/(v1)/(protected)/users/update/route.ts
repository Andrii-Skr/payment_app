import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const schema = z.object({
  user_id: z.number(),
  login: z.string().optional(),
  name: z.string().optional(),
  role_id: z.number().optional(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const { user_id, login, name, role_id } = body;
  const data: Partial<{ login: string; name: string; role_id: number }> = {};
  if (login !== undefined) data.login = login;
  if (name !== undefined) data.name = name;
  if (role_id !== undefined) data.role_id = role_id;

  const updated = await prisma.user.update({
    where: { id: user_id },
    data,
    include: { role: true },
  });

  return NextResponse.json({ success: true, updated });
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
