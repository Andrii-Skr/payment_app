// /app/api/entities/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import prisma from "@/prisma/prisma-client";
import { Roles } from "@/constants/roles";
import type { Session } from "next-auth";

type ReorderBody = {
  order: { id: number; sort_order: number }[];
};

const reorderHandler = async (
  _req: NextRequest,
  body: ReorderBody,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const updates = body.order.map((item) =>
    prisma.entity.update({
      where: { id: item.id },
      data: { sort_order: item.sort_order },
    })
  );

  await prisma.$transaction(updates);
  return NextResponse.json({ message: "Order updated" });
};

export const PATCH = apiRoute<ReorderBody>(reorderHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN],
});
