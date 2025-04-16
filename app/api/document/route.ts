import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

export type DocumentWithRelations = Prisma.documentsGetPayload<{
  include: {
    spec_doc: true;
    partners: {
      select: {
        name: true;
        edrpou: true;
      };
    };
  };
}>;

const handler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const documents: DocumentWithRelations[] = await prisma.documents.findMany({
    include: {
      spec_doc: true,
      partners: {
        select: {
          name: true,
          edrpou: true,
        },
      },
    },
  });

  return NextResponse.json(documents);
};

// ✅ Совместимо с App Router + строго типизировано
export async function GET(req: NextRequest, context: any) {
  return apiRoute<null, {}>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
