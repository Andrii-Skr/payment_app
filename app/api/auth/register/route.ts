import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";
import { Roles } from "@/constants/roles";
import prisma from "@/prisma/prisma-client";
import { type RegisterBody, registerSchema } from "@/types/registerSchema";
import { apiRoute } from "@/utils/apiRoute";
import { rateLimit } from "@/utils/rateLimiter";

const postHandler = async (req: NextRequest, body: RegisterBody) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  const { login, password, name } = body;

  // 💡 Теперь rateLimit требует и login, и ip
  const limit = rateLimit(ip, login);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message:
          limit.reason === "ip"
            ? `Слишком много попыток с IP. Подождите ${limit.retryAfter} сек.`
            : `Слишком много попыток для логина "${login}". Повторите через ${limit.retryAfter} сек.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { login } });

  if (existingUser) {
    return NextResponse.json({ message: "Логин уже используется" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      login,
      password: hashedPassword,
      name,
      role: { connect: { name: Roles.USER } },
    },
    select: {
      id: true,
      login: true,
      name: true,
    },
  });

  return NextResponse.json({ message: "Пользователь создан", user }, { status: 201 });
};

export const POST = apiRoute<RegisterBody>(postHandler, {
  schema: registerSchema,
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
