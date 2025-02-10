import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ConditionalHeader } from "@/components/shared";

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

export default function RootLayout({

  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <SessionProvider>
        <ConditionalHeader />
          {children}
          </SessionProvider>
      </body>
    </html>
  );
}
