import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/layout/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Mall - 微型电商",
  description: "Mini Mall 微型电商项目 — 精选商品，便捷购物",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-secondary text-text-primary">
        <ThemeProvider>
          <Header />
          <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-8 text-center text-sm text-text-quaternary">
            <p>© {new Date().getFullYear()} Mini Mall. 保留所有权利。</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
