import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const schema = z.object({
  id: z.number(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const { id } = body;

  const spec = await prisma.spec_doc.findUnique({ where: { id } });

  if (!spec) {
    return NextResponse.json({ error: "Спецификация не найдена" }, { status: 404 });
  }

  await prisma.spec_doc.update({
    where: { id },
    data: {
      is_paid: false,
      paid_date: null,
    },
  });

  return NextResponse.json({ success: true });
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN],
});
