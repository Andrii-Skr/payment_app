import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";

const getHandler = async () => {
  const roles = await prisma.role.findMany({
    where: { is_deleted: false },
  });
  return NextResponse.json(roles);
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
