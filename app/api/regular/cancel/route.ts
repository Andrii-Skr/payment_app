import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { hasRole } from "@/lib/access/hasRole";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type PatchBody = {
  id: number;
};

const handler = async (
  _req: NextRequest,
  body: PatchBody,
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

  const { id } = body;

  if (!id || typeof id !== "number") {
    return NextResponse.json({ message: "Неверный ID" }, { status: 400 });
  }

  const autoPayment = await prisma.auto_payment.findUnique({
    where: { id },
    select: {
      id: true,
      documents_id: true,
    },
  });

  if (!autoPayment) {
    return NextResponse.json(
      { message: "auto_payment не найден" },
      { status: 404 }
    );
  }

  const [updatedAutoPayment, updatedDocument] = await Promise.all([
    prisma.auto_payment.update({
      where: { id },
      data: { is_deleted: true, updated_at: new Date() },
    }),
    prisma.documents.update({
      where: { id: autoPayment.documents_id },
      data: { is_auto_payment: false },
    }),
  ]);

  return NextResponse.json({ updatedAutoPayment, updatedDocument });
};

// ✅ App Router-совместимая сигнатура
export async function PATCH(req: NextRequest, context: any) {
  return apiRoute<PatchBody>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
