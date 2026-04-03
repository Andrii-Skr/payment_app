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
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="login">{t("loginLabel")}</Label>
              <Input id="login" type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
