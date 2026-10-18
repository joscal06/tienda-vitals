import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Base para URLs absolutas de canonical y Open Graph.
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Voltio · Tienda de tecnología", template: "%s · Voltio" },
  description: "Tienda en línea de tecnología construida con Next.js 16, Server Actions y pagos con Stripe.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-zinc-500 sm:px-6">
              Voltio · Proyecto del Bootcamp Kodigo — frontend Next.js 16 sobre la API REST de e-commerce (Laravel 12).
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
