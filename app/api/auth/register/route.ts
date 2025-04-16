import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { registerSchema, RegisterBody } from "@/types/registerSchema";
import { rateLimit } from "@/utils/rateLimiter";

const handler = async (req: NextRequest, body: RegisterBody) => {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Слишком много попыток. Повторите через ${limit.retryAfter} сек.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  const { login, password, name } = body;

  const existingUser = await prisma.user.findUnique({ where: { login } });

  if (existingUser) {
    return NextResponse.json(
      { message: "Логин уже используется" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      login,
      password: hashedPassword,
      name,
      role: { connect: { id: 2 } }, // можно вынести в константы (например, Roles.USER)
    },
  });

  return NextResponse.json(
    { message: "Пользователь создан", user },
    { status: 201 }
  );
};

// ✅ Совместим с Next.js 15
export async function POST(req: NextRequest, context: any) {
  return apiRoute<RegisterBody>(handler, {
    schema: registerSchema,
  })(req, context);
}
