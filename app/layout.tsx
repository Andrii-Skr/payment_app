import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Next Payment",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const localeFromHeader = headerStore.get("x-locale");
  const locale = isLocale(localeFromHeader) ? localeFromHeader : DEFAULT_LOCALE;
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
