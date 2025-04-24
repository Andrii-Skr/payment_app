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
>(handler: ApiHandler<TBody, TParams>, options: ApiRouteOptions<TBody> = {}) {
  return async function route(
    req: NextRequest,
    { params }: RouteContext<TParams>
  ): Promise<NextResponse> {
    try {
      const resolvedParams = await params;

      const needsBody = !["GET", "DELETE", "HEAD", "OPTIONS"].includes(
        req.method
      );
      let bodyRaw: unknown = needsBody ? await req.json() : null;

      if (options.schema && bodyRaw !== null) {
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
        bodyRaw = parsed.data;
      }

      /* 3. auth / ACL */
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

      /* 4. передаём в бизнес-обработчик */
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
