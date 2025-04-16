import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import { auto_payment } from "@prisma/client";
import type { Session } from "next-auth";

export type AutoPaymentWithDocs = auto_payment & {
  documents: {
    id: number;
    entity_id: number;
    account_number: string;
    purpose_of_payment: string;
    entity: {
      id: number;
      name: string;
    };
    partners: {
      name: string;
    };
  };
};

const handler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    return NextResponse.json(
      { message: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  const result: AutoPaymentWithDocs[] = await prisma.auto_payment.findMany({
    where: { is_deleted: false },
    include: {
      documents: {
        select: {
          id: true,
          entity_id: true,
          account_number: true,
          purpose_of_payment: true,
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
};

// ✅ Совместимая сигнатура для App Router (Next.js 15.3.0)
export async function GET(req: NextRequest, context: any) {
  return apiRoute<null, {}>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
