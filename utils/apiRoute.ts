import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { ZodSchema } from "zod";

export type ApiHandler<
  TBody = any,
  TParams extends Record<string, string> = {}
> = (
  req: NextRequest,
  body: TBody,
  params: TParams,
  user: User | null
) => Promise<NextResponse>;

export type ApiRouteOptions<TBody = any> = {
  requireAuth?: boolean;
  roles?: string[];
  schema?: ZodSchema<TBody>;
};

export function apiRoute<
  TBody = any,
  TParams extends Record<string, string> = {}
>(handler: ApiHandler<TBody, TParams>, options: ApiRouteOptions<TBody> = {}) {
  return async function route(
    req: NextRequest,
    context: { params: TParams | Promise<TParams> }
  ): Promise<NextResponse> {
    try {
      const params = await context.params;
      const isBodyAllowed = !["GET", "DELETE"].includes(req.method);
      let bodyRaw = isBodyAllowed ? await req.json() : null;

      if (options.schema && bodyRaw) {
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
          { success: false, message: "Forbidden: insufficient role" },
          { status: 403 }
        );
      }

      return await handler(req, bodyRaw as TBody, params, user);
    } catch (err) {
      console.error("API Error:", err);
      return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 }
      );
    }
  };
}
