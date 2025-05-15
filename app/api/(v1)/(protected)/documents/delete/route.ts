import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const id = body.id;

  const doc = await prisma.documents.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
  }

  await prisma.documents.update({
    where: { id },
    data: { is_deleted: true },
  });

  return NextResponse.json({ success: true });
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
