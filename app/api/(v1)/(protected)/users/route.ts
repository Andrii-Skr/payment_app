import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/* ----------------------------- Schemas ----------------------------- */
const roleSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
});

const linkSchema = z.object({
  user_id: z.number(),
  add_entities: z.array(z.number()).optional(),
  remove_entities: z.array(z.number()).optional(),
  add_partners: z
    .array(z.object({ partner_id: z.number(), entity_id: z.number() }))
    .optional(),
  remove_partners: z
    .array(z.object({ partner_id: z.number(), entity_id: z.number() }))
    .optional(),
});

type RoleBody = z.infer<typeof roleSchema>;

type LinkBody = z.infer<typeof linkSchema>;

export const userQuery = Prisma.validator<Prisma.userFindManyArgs>()({
  select: {
    id: true,
    login: true,
    name: true,
    role: true,
    users_entities: {
      select: {
        entity: true,
      },
    },
    users_partners: {
      select: {
        partner_id: true,
        entity_id: true,
        partners: true,
      },
    },
    is_deleted: true,
  },
});
export type UserWithRelations = Prisma.userGetPayload<typeof userQuery>;

/* ----------------------------- Handlers ---------------------------- */
const getHandler = async (req: NextRequest) => {
  const withDeleted = req.nextUrl.searchParams.get("withDeleted") === "true";
  const users = await prisma.user.findMany({
    where: withDeleted ? {} : { is_deleted: false },
    ...userQuery,
  });
  return NextResponse.json(users);
};

const patchHandler = async (_req: NextRequest, body: RoleBody) => {
  const updated = await prisma.user.update({
    where: { id: body.user_id },
    data: { role_id: body.role_id },
    include: { role: true },
  });

  return NextResponse.json({ success: true, updated });
};

const postHandler = async (_req: NextRequest, body: LinkBody) => {
  const {
    user_id,
    add_entities = [],
    remove_entities = [],
    add_partners = [],
    remove_partners = [],
  } = body;

  await prisma.$transaction(async (tx) => {
    if (add_entities.length > 0) {
      await tx.users_entities.createMany({
        data: add_entities.map((entity_id) => ({ user_id, entity_id })),
        skipDuplicates: true,
      });
    }

    if (remove_entities.length > 0) {
      await tx.users_entities.deleteMany({
        where: { user_id, entity_id: { in: remove_entities } },
      });
    }

    if (add_partners.length > 0) {
      await tx.users_partners.createMany({
        data: add_partners.map(({ partner_id, entity_id }) => ({
          user_id,
          partner_id,
          entity_id,
        })),
        skipDuplicates: true,
      });
    }

    if (remove_partners.length > 0) {
      await tx.users_partners.deleteMany({
        where: {
          user_id,
          OR: remove_partners.map(({ partner_id, entity_id }) => ({
            partner_id,
            entity_id,
          })),
        },
      });
    }
  });

  return NextResponse.json({ success: true });
};

/* ------------------------------ Export ----------------------------- */
export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const PATCH = apiRoute<RoleBody>(patchHandler, {
  schema: roleSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const POST = apiRoute<LinkBody>(postHandler, {
  schema: linkSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
