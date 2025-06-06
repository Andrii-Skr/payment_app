import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";

const schema = z.object({
  partner_account_number_id: z.number(),
  entity_id: z.number(),
  is_default: z.boolean(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const { partner_account_number_id, entity_id, is_default } = body;

  try {
    const updated = await prisma.partner_account_numbers_on_entities.update({
      where: {
        entity_id_partner_account_number_id: {
          entity_id,
          partner_account_number_id,
        },
      },
      data: { is_default },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Ошибка при обновлении is_default:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PATCH = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
