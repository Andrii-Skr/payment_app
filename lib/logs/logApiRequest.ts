import type { NextRequest } from "next/server";
import type { User } from "next-auth";
import { redactBody } from "./redactBody";
import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";

export async function logApiRequest(
  req: NextRequest,
  user: User | null,
  status: number,
  startedAt: number,
  bodyRaw?: unknown // ← NEW
) {
  const ip =
    (req as any).ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  const numericUserId =
    user?.id !== undefined && !Number.isNaN(Number(user.id))
      ? Number(user.id)
      : null;

  // сериализуем тело, редактируя чувствительные поля; ограничиваем 8 KiB
  let body_json: any = null;
  if (bodyRaw !== undefined) {
    try {
      const redacted = redactBody(bodyRaw);
      const str = JSON.stringify(redacted);
      body_json = str.length <= 8192 ? redacted : { truncated: true };
    } catch {
      /* ignore serialization errors */
    }
  }

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
        body_json: body_json as Prisma.InputJsonValue, // 👈 явное указание типа
      },
    })
    .catch(console.error);
}
