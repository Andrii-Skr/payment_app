
import type { NextRequest } from "next/server";
import type { User } from "next-auth";
import prisma from "@/prisma/prisma-client";

export async function logApiRequest(
  req: NextRequest,
  user: User | null,
  status: number,
  startedAt: number
) {
  const ip =
    (req as any).ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  const numericUserId =
    user?.id !== undefined && !Number.isNaN(Number(user.id))
      ? Number(user.id)
      : null;

  prisma.api_request_log
    .create({
      data: {
        user_id: numericUserId,
        ip,
        route: req.nextUrl.pathname,
        method: req.method,
        status,
        duration: Math.round(performance.now() - startedAt),
        user_agent: req.headers.get("user-agent") ?? null,
      },
    })
    .catch(console.error);
}
