import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSession } from "../lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill Builder Webapp",
  description: "Local-first Claude Code skill building platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body data-authenticated={session.authenticated ? "true" : "false"}>{children}</body>
    </html>
  );
}
