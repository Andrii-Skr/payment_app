import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";

/* ----------------------------- Zod схема ----------------------------- */

const partnerSchema = z.object({
  full_name: z.string(),
  short_name: z.string(),
  edrpou: z.string(),
  entity_id: z.number(),
  type: z.string().optional(),
  bank_account: z.string(),
  mfo: z.string(),
  bank_name: z.string(),
});

type PartnerBody = z.infer<typeof partnerSchema>;

/* ---------------------------- POST handler ---------------------------- */

const handler = async (
  _req: NextRequest,
  body: PartnerBody
): Promise<NextResponse> => {
  const {
    full_name,
    short_name,
    edrpou,
    entity_id,
    bank_account,
    mfo,
    bank_name,
    type,
  } = body;

  const existingPartner = await prisma.partners.findUnique({
    where: { edrpou },
    include: {
      entities: true,
      partner_account_number: true,
    },
  });

  if (existingPartner) {
    // Проверка: уже привязан к entity?
    const alreadyLinked = existingPartner.entities.some(
      (e) => e.entity_id === entity_id
    );

    if (!alreadyLinked) {
      await prisma.partners_on_entities.create({
        data: {
          entity_id,
          partner_id: existingPartner.id,
        },
      });
    }

    // НЕ создаём банковский счёт повторно, просто возвращаем
    return NextResponse.json(
      { success: true, partner: existingPartner, reused: true },
      { status: 200 }
    );
  }

  // Новый партнёр: создаём полностью
  const partner = await prisma.partners.create({
    data: {
      full_name,
      short_name,
      edrpou,
      type: type ? Number(type) : undefined,
      partner_account_number: {
        create: {
          bank_account,
          mfo,
          bank_name,
          is_default: false,
        },
      },
      entities: {
        create: {
          entity: {
            connect: { id: entity_id },
          },
        },
      },
    },
  });

  return NextResponse.json(
    { success: true, partner, reused: false },
    { status: 201 }
  );
};

/* ------------------------------ Экспорт ------------------------------ */

export const POST = apiRoute<PartnerBody>(handler, {
  schema: partnerSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
