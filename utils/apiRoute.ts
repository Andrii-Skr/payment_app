// src/utils/apiRoute.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { logApiRequest } from "@/lib/logs/logApiRequest"; // ← добавили
import type { ZodSchema } from "zod";

/* ---------- Типы (без изменений) ---------- */
export type RouteContext<T extends Record<string, string> = {}> = {
  params: Promise<T>;
};

export type ApiHandler<
  TBody = unknown,
  TParams extends Record<string, string> = {}
> = (
  req: NextRequest,
  body: TBody,
  params: TParams,
  user: User | null
) => Promise<NextResponse>;

export type ApiRouteOptions<TBody = unknown> = {
  requireAuth?: boolean;
  roles?: string[];
  schema?: ZodSchema<TBody>;
};

/* ---------- Обёртка ---------- */
export function apiRoute<
  TBody = unknown,
  TParams extends Record<string, string> = {}
>(handler: ApiHandler<TBody, TParams>, options: ApiRouteOptions<TBody> = {}) {
  return async function route(
    req: NextRequest,
    { params }: RouteContext<TParams>
  ): Promise<NextResponse> {
    const started = performance.now(); // ⬅️ точка старта
    let status = 200;
    let user: User | null = null;

    try {
      const resolvedParams = await params;

      /* ---------- Чтение тела ---------- */
      const needsBody = !["GET", "HEAD", "OPTIONS", "DELETE"].includes(
        req.method
      );
      let bodyRaw: unknown = null;

      if (needsBody) {
        try {
          bodyRaw = await req.json();
        } catch {
          status = 400;
          return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status }
          );
        }

        /* ---------- Валидация ---------- */
        if (options.schema) {
          const parsed = options.schema.safeParse(bodyRaw);
          if (!parsed.success) {
            status = 400;
            return NextResponse.json(
              {
                success: false,
                message: "Validation error",
                errors: parsed.error.format(),
              },
              { status }
            );
          }
          bodyRaw = parsed.data;
        }
      }

      /* ---------- Аутентификация / роли ---------- */
      const session = await getServerSession(authOptions);
      user = session?.user as User | null;

      if (options.requireAuth && !user?.id) {
        status = 401;
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status }
        );
      }

      if (options.roles && user && !options.roles.includes(user.role)) {
        status = 403;
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status }
        );
      }

      /* ---------- Передаём управление хендлеру ---------- */
      const res = await handler(req, bodyRaw as TBody, resolvedParams, user);
      status = res.status;
      return res;
    } catch (err) {
      console.error("API Error:", err);
      status = 500;
      return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status }
      );
    } finally {
      // 🔥 Записываем лог независимо от результата
      logApiRequest(req, user, status, started);
    }
  };
}
