import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import { dashFont, hindiFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${APP_NAME}.ai · Your shop, online in minutes`, template: `%s · ${APP_NAME}.ai` },
  description: "Paste your Google profile or pick a few cards. Sitewise builds your shop's website and sends enquiries to your dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dashFont.variable} ${hindiFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
