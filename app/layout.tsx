import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "./root-layout-client";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Campus Portal | ECA Capstone",
  description: "Enterprise Cloud Architecture – Campus Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased bg-slate-50`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
