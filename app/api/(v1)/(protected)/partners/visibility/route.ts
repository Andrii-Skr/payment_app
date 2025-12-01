import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const schema = z.object({
  partner_id: z.number(),
  entity_id: z.number(),
  is_visible: z.boolean(),
});

type Body = z.infer<typeof schema>;

const patchHandler = async (
  _req: NextRequest,
  body: Body,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const updated = await prisma.partners_on_entities.update({
      where: {
        entity_id_partner_id: {
          entity_id: body.entity_id,
          partner_id: body.partner_id,
        },
      },
      data: {
        is_visible: body.is_visible,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Ошибка при обновлении is_visible:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

const querySchema = z.object({
  partner_id: z.coerce.number(),
  entity_id: z.coerce.number(),
});

const getHandler = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    partner_id: searchParams.get("partner_id"),
    entity_id: searchParams.get("entity_id"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { partner_id, entity_id } = parsed.data;

  try {
    const record = await prisma.partners_on_entities.findUnique({
      where: {
        entity_id_partner_id: {
          entity_id,
          partner_id,
        },
      },
      select: {
        is_visible: true,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Ошибка при получении is_visible:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const PATCH = apiRoute<Body>(patchHandler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
