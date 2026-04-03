import type { AbstractIntlMessages } from "next-intl";
import enCommon from "@/messages/en/common.json";
import ruCommon from "@/messages/ru/common.json";
import ukCommon from "@/messages/uk/common.json";
import type { AppLocale } from "./locales";

const messagesByLocale: Record<AppLocale, AbstractIntlMessages> = {
  en: enCommon,
  ru: ruCommon,
  uk: ukCommon,
};

export function getMessages(locale: AppLocale): AbstractIntlMessages {
  return messagesByLocale[locale];
}
