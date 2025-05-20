import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  partner_id: z.number(),
  bank_account: z.string().length(29),
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
  is_default: z.boolean().optional(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  
  const created = await prisma.partner_account_number.create({
    data: {
      partner_id: body.partner_id,
      bank_account: body.bank_account,
      mfo: body.mfo,
      bank_name: body.bank_name,
      is_default: body.is_default ?? false,
    },
  });

  return NextResponse.json({ success: true, created });
};

export const POST = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
