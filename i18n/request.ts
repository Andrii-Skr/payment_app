import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

export default getRequestConfig(async () => {
  const headerStore = await headers();
  const localeFromHeader = headerStore.get("x-locale");
  const locale = isLocale(localeFromHeader) ? localeFromHeader : DEFAULT_LOCALE;

  return {
    locale,
    messages: getMessages(locale),
  };
});
