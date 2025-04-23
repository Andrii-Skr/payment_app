"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/hooks/use-toast";

export default function SignIn() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
            <Label htmlFor="username" className="sr-only">
              Логин
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              className="w-full"
              placeholder="Логин"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          {/* Пароль */}
          <div className="space-y-1">
            <Label htmlFor="password" className="sr-only inline-flex">
              Пароль
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="w-full"
              placeholder="Пароль"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Кнопка входа */}
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
