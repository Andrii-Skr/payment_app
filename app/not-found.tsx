"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocalePath } from "@/lib/hooks/useLocalePath";

export default function NotFound() {
  const t = useTranslations("notFound");
  const { withLocale } = useLocalePath();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link
        href={withLocale("/create")}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-90 transition"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
