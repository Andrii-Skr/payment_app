import type { ReactNode } from "react";

type Values = Record<string, unknown> | undefined;

const interpolate = (input: string, values: Values) => {
  if (!values) return input;

  return Object.entries(values).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, input);
};

export const NextIntlClientProvider = ({ children }: { children: ReactNode }) => children;

export const useTranslations = (namespace?: string) => {
  return (key: string, values?: Values) => {
    const base = namespace ? `${namespace}.${key}` : key;
    return interpolate(base, values);
  };
};
