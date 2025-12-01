"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/hooks/use-toast";

export default function SignIn() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Берём значения прямо из формы (автозаполнение уже там)
    const formData = new FormData(e.currentTarget);
    const login = (formData.get("login") ?? "").toString();
    const password = (formData.get("password") ?? "").toString();

    if (!login || !password) {
      toast.error("Введите логин и пароль");
      return;
    }

    // 2. Отправляем их в NextAuth
    const result = await signIn("credentials", {
      login,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/create");
    } else {
      toast.error("Ошибка входа");
    }
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-3xl shadow-md w-[340px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Вход</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Логин */}
          <div className="space-y-1">
            <Label htmlFor="login" className="sr-only">
              Логин
            </Label>
            <Input
              id="login"
              name="login" /* <- было username */
              type="text"
              autoComplete="username"
              placeholder="Логин"
              required
            />
          </div>

          {/* Пароль */}
          <div className="space-y-1">
            <Label htmlFor="password" className="sr-only">
              Пароль
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Пароль"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
