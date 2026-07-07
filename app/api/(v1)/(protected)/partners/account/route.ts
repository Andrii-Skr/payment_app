// src/app/api/partners/account/route.ts

import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import { bankAccountSchema } from "@/lib/validators/bankAccount";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

const schema = z.object({
  partner_id: z.number(),
  entity_id: z.number(),
  additional_entity_ids: z.array(z.number()).optional(),
  bank_account: bankAccountSchema,
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
  is_default: z.boolean().optional(),
});

type Body = z.infer<typeof schema>;

const updateSchema = z.object({
  partner_account_number_id: z.number(),
  entity_id: z.number(),
  bank_account: bankAccountSchema,
});

type UpdateBody = z.infer<typeof updateSchema>;

const accountInclude = {
  entities: true,
} as const;

const handler = async (_req: NextRequest, body: Body, _params: Record<string, never>, user: Session["user"] | null) => {
  const additionalEntityIds = body.additional_entity_ids ?? [];
  const requestedEntityIds = Array.from(new Set([body.entity_id, ...additionalEntityIds]));

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    const dbUser = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: {
        users_entities: { select: { entity_id: true } },
        users_partners: {
          where: { partner_id: body.partner_id },
          select: { entity_id: true },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const accessibleEntityIds = new Set([
      ...dbUser.users_entities.map((relation) => relation.entity_id),
      ...dbUser.users_partners.map((relation) => relation.entity_id),
    ]);

    if (!requestedEntityIds.every((entityId) => accessibleEntityIds.has(entityId))) {
      return NextResponse.json({ success: false, message: "Недостаточно прав для привязки счёта" }, { status: 403 });
    }
  }

  const partnerRelations = await prisma.partners_on_entities.findMany({
    where: {
      partner_id: body.partner_id,
      entity_id: { in: requestedEntityIds },
      is_deleted: false,
      entity: {
        is_deleted: false,
      },
    },
    select: {
      entity_id: true,
    },
  });

  const allowedEntityIds = new Set(partnerRelations.map((relation) => relation.entity_id));

  if (!allowedEntityIds.has(body.entity_id)) {
    return NextResponse.json({ success: false, message: "Контрагент не связан с выбранным юрлицом" }, { status: 409 });
  }

  const targetEntityIds = requestedEntityIds.filter((entityId) => allowedEntityIds.has(entityId));

  const existing = await prisma.partner_account_number.findFirst({
    where: {
      partner_id: body.partner_id,
      bank_account: body.bank_account,
    },
    include: accountInclude,
  });

  if (existing) {
    const existingLinkedEntityIds = new Set(existing.entities.map((entity) => entity.entity_id));
    const createdEntityIds: number[] = [];
    const skippedEntityIds = targetEntityIds.filter((entityId) => existingLinkedEntityIds.has(entityId));

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

      for (const entityId of targetEntityIds) {
        if (existingLinkedEntityIds.has(entityId)) {
          continue;
        }

        await tx.partner_account_numbers_on_entities.create({
          data: {
            entity_id: entityId,
            partner_account_number_id: existing.id,
            is_default: entityId === body.entity_id ? (body.is_default ?? false) : false,
          },
        });
        createdEntityIds.push(entityId);
      }

      if (existingLinkedEntityIds.has(body.entity_id) && body.is_default) {
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

    const freshAccount = await prisma.partner_account_number.findUniqueOrThrow({
      where: { id: existing.id },
      include: accountInclude,
    });

    return NextResponse.json({
      success: true,
      created: freshAccount,
      linked_entity_ids: createdEntityIds,
      skipped_entity_ids: skippedEntityIds,
      message: skippedEntityIds.length > 0 ? "Счёт уже был привязан к части юрлиц." : undefined,
    });
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

    for (const entityId of targetEntityIds) {
      await tx.partner_account_numbers_on_entities.create({
        data: {
          entity_id: entityId,
          partner_account_number_id: created.id,
          is_default: entityId === body.entity_id ? (body.is_default ?? false) : false,
        },
      });
    }
  });

  const freshAccount = await prisma.partner_account_number.findUniqueOrThrow({
    where: { id: created.id },
    include: accountInclude,
  });

  return NextResponse.json({
    success: true,
    created: freshAccount,
    linked_entity_ids: targetEntityIds,
    skipped_entity_ids: [],
  });
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
