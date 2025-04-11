import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { login, password, name } = body;

  if (!login || !password || !name) {
    return NextResponse.json({ message: "Все поля обязательны" }, { status: 400 });
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
      role: { connect: { id: 2} }, // по умолчанию, роль user с id = 2
    },
  });

  return NextResponse.json({ message: "Пользователь создан", user }, { status: 201 });
}
