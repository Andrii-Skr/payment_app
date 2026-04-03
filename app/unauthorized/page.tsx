"use client";

import { useTranslations } from "next-intl";

export default function UnauthorizedPage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-2 px-4">
      <h1 className="text-2xl font-bold text-red-500">{t("unauthorizedTitle")}</h1>
      <p className="text-muted-foreground">{t("unauthorizedDescription")}</p>
    </div>
  );
}
