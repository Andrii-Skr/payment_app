import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

type PatchBody = {
  id: number;
};

const patchHandler = async (
  _req: NextRequest,
  body: PatchBody,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
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
    return NextResponse.json({ message: "auto_payment не найден" }, { status: 404 });
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

export const PATCH = apiRoute<PatchBody>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
