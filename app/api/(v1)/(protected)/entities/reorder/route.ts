// /app/api/entities/reorder/route.ts
import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";

type ReorderBody = {
  order: { id: number; sort_order: number }[];
};

const reorderHandler = async (
  _req: NextRequest,
  body: ReorderBody,
  _params: Record<string, never>,
  user: Session["user"] | null,
) => {
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const updates = body.order.map((item) =>
    prisma.entity.update({
      where: { id: item.id },
      data: { sort_order: item.sort_order },
    }),
  );

  await prisma.$transaction(updates);
  return NextResponse.json({ message: "Order updated" });
};

export const PATCH = apiRoute<ReorderBody>(reorderHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN],
});
