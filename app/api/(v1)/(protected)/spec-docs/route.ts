import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type MarkAsPaidBody = {
  specDocIds: number[];
};

const postHandler = async (
  _req: NextRequest,
  body: MarkAsPaidBody,
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

  if (!Array.isArray(body.specDocIds) || body.specDocIds.length === 0) {
    return NextResponse.json(
      { message: "specDocIds must be a non-empty array" },
      { status: 400 }
    );
  }

  const updatedRecords = await prisma.spec_doc.updateMany({
    where: {
      id: { in: body.specDocIds },
    },
    data: {
      is_paid: true,
      paid_date: new Date(),
    },
  });

  if (updatedRecords.count === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "No records updated. Check IDs or permissions.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: `${updatedRecords.count} records marked as paid.`,
    },
    { status: 200 }
  );
};

export const POST = apiRoute<MarkAsPaidBody>(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
