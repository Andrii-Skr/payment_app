import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Roles } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";
import type { Session } from "next-auth";

type Params = { entity_id: string };

const handler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entityId = parseInt(params.entity_id, 10);
  if (isNaN(entityId)) {
    return NextResponse.json({ message: "Invalid entity ID" }, { status: 400 });
  }

  const isPrivileged = hasRole(user.role, [Roles.ADMIN, Roles.MANAGER]);

  const templates = await prisma.template.findMany({
    where: {
      entity_id: entityId,
      ...(isPrivileged ? {} : { user_id: Number(user.id) }),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(templates);
};

// ✅ Совместимо с Next.js 15.3.0 (динамический параметр)
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  return apiRoute<null, Params>(handler, {
    requireAuth: true,
    roles: [Roles.ADMIN, Roles.MANAGER],
  })(req, context);
}
