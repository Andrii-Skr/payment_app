import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type Params = { partner_id: string };

const handler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const partnerId = parseInt(params.partner_id, 10);
  if (isNaN(partnerId)) {
    return NextResponse.json(
      { message: "Invalid partner ID" },
      { status: 400 }
    );
  }

  const documents = await prisma.documents.findMany({
    where: {
      partner_id: partnerId,
      is_deleted: false,
    },
    include: {
      spec_doc: true,
    },
  });

  return NextResponse.json(documents);
};

// ✅ App Router совместимая сигнатура с поддержкой динамических params
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  return apiRoute<null, Params>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER],
  })(req, context);
}
