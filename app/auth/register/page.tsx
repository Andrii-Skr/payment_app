"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { useLocalePath } from "@/lib/hooks/useLocalePath";

export default function Register() {
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { withLocale } = useLocalePath();
  const t = useTranslations("auth.register");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, name, password }),
    });

    if (res.ok) {
      toast.success(t("success"));
      router.push(withLocale("/auth/signin"));
    } else {
      const data = await res.json();
      toast.error(data.message || t("error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-6 text-center">{t("title")}</h1>
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            <input
              type="text"
              name="username"
              autoComplete="username"
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
            />
            <input
              type="password"
              name="current-password"
              autoComplete="current-password"
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
            />
            <div>
              <Label htmlFor="login">{t("loginLabel")}</Label>
              <Input
                id="login"
                name="new-login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="new-password"
                className="w-full !max-w-none !h-8"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                name="new-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="w-full !max-w-none !h-8"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input
                id="password"
                name="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full !max-w-none !h-8"
                required
              />
            </div>
            <Button type="submit" size="sm" className="w-full !h-8">
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
