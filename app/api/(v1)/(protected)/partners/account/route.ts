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

const updateSchema = z.object({
  partner_account_number_id: z.number(),
  entity_id: z.number(),
  bank_account: z.string().length(29),
});

type UpdateBody = z.infer<typeof updateSchema>;

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

const updateHandler = async (_req: NextRequest, body: UpdateBody) => {
  const { partner_account_number_id, entity_id, bank_account } = body;

  const account = await prisma.partner_account_number.findUnique({
    where: { id: partner_account_number_id },
    select: { id: true, partner_id: true },
  });

  if (!account) {
    return NextResponse.json({ success: false, message: "Счёт не найден" }, { status: 404 });
  }

  const link = await prisma.partner_account_numbers_on_entities.findUnique({
    where: {
      entity_id_partner_account_number_id: {
        entity_id,
        partner_account_number_id,
      },
    },
    select: { is_deleted: true },
  });

  if (!link) {
    return NextResponse.json({ success: false, message: "Счёт не найден у юрлица" }, { status: 404 });
  }

  if (link.is_deleted) {
    return NextResponse.json({ success: false, message: "Счёт удалён" }, { status: 409 });
  }

  const docsCount = await prisma.documents.count({
    where: { partner_account_number_id },
  });

  if (docsCount > 0) {
    return NextResponse.json({ success: false, message: "Нельзя редактировать счёт с документами" }, { status: 409 });
  }

  const duplicate = await prisma.partner_account_number.findFirst({
    where: {
      partner_id: account.partner_id,
      bank_account,
      NOT: { id: partner_account_number_id },
    },
    select: { id: true },
  });

  if (duplicate) {
    return NextResponse.json({ success: false, message: "Счёт уже существует у контрагента" }, { status: 409 });
  }

  const updated = await prisma.partner_account_number.update({
    where: { id: partner_account_number_id },
    data: { bank_account },
  });

  return NextResponse.json({ success: true, updated });
};

export const PATCH = apiRoute<UpdateBody>(updateHandler, {
  schema: updateSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
