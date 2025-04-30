import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type Params = { id: string };

const getHandler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const partnerId = parseInt(params.id, 10);
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


export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
