// ──────────────────────────────────────────────────────────────
// app/api/auth/[...nextauth]/route.ts
// ──────────────────────────────────────────────────────────────

import type { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";

import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/authOptions";
import { logApiRequest } from "@/lib/logs/logApiRequest";

// Базовый обработчик, который NextAuth создаёт из ваших опций
const nextAuthHandler = NextAuth(authOptions);

/**
 * Обёртка: передаём запрос в NextAuth, затем логируем.
 * NB: подпись должна принимать context с params.nextauth!
 */
async function handleAuth(req: NextRequest, ctx: { params: { nextauth: string[] } }): Promise<NextResponse> {
  const started = performance.now();
  // проксируем запрос в NextAuth, обязательно передаём ctx
  const res = await nextAuthHandler(req, ctx);
  const status = res.status;

  // --- достаём userId из JWT (если уже залогинен) ---
  let numericUserId: number | null = null;
  try {
    const token = await getToken({ req });
    if (token?.sub && !Number.isNaN(Number(token.sub))) {
      numericUserId = Number(token.sub);
    }
  } catch {
    /* ignore – нет токена или он ещё не создан */
  }

  // --- логируем ---
  void logApiRequest(req, numericUserId ? ({ id: numericUserId } as any) : null, status, started);

  return res;
}

/* Один и тот же хендлер для любых методов, которые использует NextAuth */
export const GET = handleAuth;
export const POST = handleAuth;
