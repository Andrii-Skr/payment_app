// app/api/partner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";

/* -------------------------------------------------------------------------- */
/*                                    DTO                                     */
/* -------------------------------------------------------------------------- */

const partnerSchema = z.object({
  name: z.string(),
  edrpou: z.string(),
  entity_id: z.number(),
  type: z.string().optional(),
  bank_account: z.string(),
  mfo: z.string(),
  bank_name: z.string(),
});

type PartnerBody = z.infer<typeof partnerSchema>;

/* -------------------------------------------------------------------------- */
/*                                  handler                                   */
/* -------------------------------------------------------------------------- */

const handler = async (
  _req: NextRequest,
  body: PartnerBody
): Promise<NextResponse> => {
  const { name, edrpou, entity_id, bank_account, mfo, bank_name } = body;

  const partner = await prisma.partners.create({
    data: {
      name,
      edrpou,
      entity_id,
      partner_account_number: {
        create: {
          bank_account: bank_account,
          mfo: mfo,
          bank_name: bank_name,
        },
      },
    },
  });

  return NextResponse.json({ success: true, partner }, { status: 201 });
};

/* -------------------------------------------------------------------------- */
/*                                   route                                    */
/* -------------------------------------------------------------------------- */

export const POST = apiRoute<PartnerBody>(handler, {
  schema: partnerSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
