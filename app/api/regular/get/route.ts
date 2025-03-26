import prisma from "@/prisma/prisma-client";
import { auto_payment } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const result = await prisma.auto_payment.findMany({
    where: {},
    include: {
      documents: {
        select: {
          entity: {
            select: {
              name: true,
            },
          },
          partners: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(result);
}
