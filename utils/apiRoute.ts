import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { ZodSchema } from "zod";

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

export function apiRoute<
  TBody = unknown,
  TParams extends Record<string, string> = {}
>(
  handler: ApiHandler<TBody, TParams>,
  options: ApiRouteOptions<TBody> = {}
) {
  return async function route(
    req: NextRequest,
    { params }: RouteContext<TParams>
  ): Promise<NextResponse> {
    try {
      const resolvedParams = await params;

      /* ---------- Чтение тела запроса ---------- */
      const needsBody = !["GET", "HEAD", "OPTIONS", "DELETE"].includes(
        req.method
      );
      let bodyRaw: unknown = null;

      if (needsBody) {
        try {
          bodyRaw = await req.json(); // здесь падаем, если тело не JSON
        } catch {
          return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status: 400 }
          );
        }

        // ----------- Валидация по схеме -----------
        if (options.schema) {
          const parsed = options.schema.safeParse(bodyRaw);
          if (!parsed.success) {
            return NextResponse.json(
              {
                success: false,
                message: "Validation error",
                errors: parsed.error.format(),
              },
              { status: 400 }
            );
          }
          bodyRaw = parsed.data; // после успешной валидации используем парс-данные
        }
      }

      /* ---------- Аутентификация / авторизация ---------- */
      const session = await getServerSession(authOptions);
      const user = session?.user as User | null;

      if (options.requireAuth && !user?.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (options.roles && user && !options.roles.includes(user.role)) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }

      /* ---------- Передаём управление хендлеру ---------- */
      return handler(req, bodyRaw as TBody, resolvedParams, user);
    } catch (err) {
      console.error("API Error:", err);
      return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 }
      );
    }
  };
}
