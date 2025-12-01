import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

// 🔧 Теперь требуем entity_id + partner_id
const schema = z.object({
  partner_id: z.number(),
  entity_id: z.number(),
  is_deleted: z.boolean(),
});

type Body = z.infer<typeof schema>;

const patchHandler = async (
  _req: NextRequest,
  body: Body,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await prisma.partners_on_entities.update({
      where: {
        entity_id_partner_id: {
          entity_id: body.entity_id,
          partner_id: body.partner_id,
        },
      },
      data: {
        is_deleted: body.is_deleted,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Ошибка при обновлении is_deleted в partners_on_entities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const PATCH = apiRoute<Body>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN],
});
