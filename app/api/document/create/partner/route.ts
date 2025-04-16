import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { z } from "zod";
import { apiRoute } from "@/utils/apiRoute";


const partnerSchema = z.object({
  name: z.string(),
  edrpou: z.string(),
  entity_id: z.number(),
});

type PartnerBody = z.infer<typeof partnerSchema>;

const handler = async (
  _req: NextRequest,
  body: PartnerBody,
  _params: {}, // статичный путь
  _user: any
): Promise<NextResponse> => {
  const partner = await prisma.partners.create({
    data: {
      name: body.name,
      edrpou: body.edrpou,
      entity_id: body.entity_id,
      type: 0,
      group: [],
    },
  });

  return NextResponse.json({
    success: true,
    partner,
  });
};

// ✅ Рабочая сигнатура для Next.js 15 — context не типизируем явно
export async function POST(req: NextRequest, context: any) {
  return apiRoute<PartnerBody>(handler, {
    schema: partnerSchema,
    requireAuth: true,
  })(req, context);
}
