"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/hooks/use-toast";
import { useLocalePath } from "@/lib/hooks/useLocalePath";

export default function SignIn() {
  const router = useRouter();
  const { withLocale } = useLocalePath();
  const t = useTranslations("auth.signIn");
  const tErrors = useTranslations("errors");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const login = (formData.get("login") ?? "").toString();
    const password = (formData.get("password") ?? "").toString();

    if (!login || !password) {
      toast.error(tErrors("requiredCredentials"));
      return;
    }

    const result = await signIn("credentials", {
      login,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push(withLocale("/create"));
    } else {
      toast.error(tErrors("signInFailed"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-3xl shadow-md w-[340px]">
        <h1 className="text-2xl font-bold mb-4 text-center">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1">
            <Label htmlFor="login" className="sr-only">
              {t("loginLabel")}
            </Label>
            <Input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              placeholder={t("loginPlaceholder")}
              className="w-full !max-w-none !h-8"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="sr-only">
              {t("passwordLabel")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              className="w-full !max-w-none !h-8"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
