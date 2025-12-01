import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import type { User } from "next-auth";
import prisma from "@/prisma/prisma-client";
import { redactBody } from "./redactBody";

export async function logApiRequest(
  req: NextRequest,
  user: User | null,
  status: number,
  startedAt: number,
  bodyRaw?: unknown,
) {
  try {
    /* ---------- собираем данные ---------- */
    const ip =
      // next 15 подставляет .ip, fallback на заголовки
      (req as any).ip ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const numericUserId = user?.id !== undefined && !Number.isNaN(Number(user.id)) ? Number(user.id) : null;

    let body_json: Prisma.InputJsonValue | null | unknown = null;
    if (bodyRaw !== undefined) {
      const redacted = redactBody(bodyRaw);
      const str = JSON.stringify(redacted);
      body_json = str.length <= 8_192 ? redacted : { truncated: true };
    }

    /* ---------- сам INSERT ---------- */
    if (!(prisma as any).api_request_log?.create) {
      // клиент сгенерирован без модели – молча пропускаем
      return;
    }

    await prisma.api_request_log.create({
      data: {
        user_id: numericUserId,
        ip,
        route: req.nextUrl.pathname,
        method: req.method,
        status,
        duration: Math.round(performance.now() - startedAt),
        user_agent: req.headers.get("user-agent") ?? null,
        body_json: body_json as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // никогда не бьём основной запрос
    console.error("[logApiRequest]", err);
  }
}
