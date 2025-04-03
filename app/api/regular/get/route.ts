import prisma from "@/prisma/prisma-client";
import { auto_payment } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export type AutoPaymentWithDocs = auto_payment & {
  documents: {
    id: number;
    entity_id: number;
    account_number: string;
    entity: {
      id: number;
      name: string;
    };
    partners: {
      name: string;
    };
  };
};

export async function GET(req: NextRequest) {
  const result:AutoPaymentWithDocs[] = await prisma.auto_payment.findMany({
    where: {},
    include: {
      documents: {
        select: {
          id: true,
          entity_id: true,
          account_number: true,
          entity: {
            select: {
              id: true,
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
