// src/app/api/partners/account/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const schema = z.object({
  partner_id: z.number(),
  entity_id: z.number(),
  bank_account: z.string().length(29),
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
  is_default: z.boolean().optional(),
});

type Body = z.infer<typeof schema>;

const handler = async (_req: NextRequest, body: Body) => {
  const existing = await prisma.partner_account_number.findFirst({
    where: {
      partner_id: body.partner_id,
      bank_account: body.bank_account,
    },
    include: {
      entities: true,
    },
  });

  if (existing) {
    const alreadyLinked = existing.entities.some((e) => e.entity_id === body.entity_id);

    await prisma.$transaction(async (tx) => {
      if (body.is_default) {
        await tx.partner_account_numbers_on_entities.updateMany({
          where: {
            entity_id: body.entity_id,
            partner_account_number: { partner_id: body.partner_id },
          },
          data: { is_default: false },
        });
      }

      if (!alreadyLinked) {
        await tx.partner_account_numbers_on_entities.create({
          data: {
            entity_id: body.entity_id,
            partner_account_number_id: existing.id,
            is_default: body.is_default ?? false,
          },
        });
      } else if (body.is_default) {
        await tx.partner_account_numbers_on_entities.update({
          where: {
            entity_id_partner_account_number_id: {
              entity_id: body.entity_id,
              partner_account_number_id: existing.id,
            },
          },
          data: { is_default: true },
        });
      }
    });

    if (alreadyLinked) {
      return NextResponse.json({
        success: true,
        created: existing,
        message: "Счёт уже существует у партнёра.",
      });
    }

    return NextResponse.json({ success: true, created: existing });
  }

  const created = await prisma.partner_account_number.create({
    data: {
      partner_id: body.partner_id,
      bank_account: body.bank_account,
      mfo: body.mfo,
      bank_name: body.bank_name,
    },
  });

  await prisma.$transaction(async (tx) => {
    if (body.is_default) {
      await tx.partner_account_numbers_on_entities.updateMany({
        where: {
          entity_id: body.entity_id,
          partner_account_number: { partner_id: body.partner_id },
        },
        data: { is_default: false },
      });
    }

    await tx.partner_account_numbers_on_entities.create({
      data: {
        entity_id: body.entity_id,
        partner_account_number_id: created.id,
        is_default: body.is_default ?? false,
      },
    });
  });

  return NextResponse.json({ success: true, created });
};

export const POST = apiRoute<Body>(handler, {
  schema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
