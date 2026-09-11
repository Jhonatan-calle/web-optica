import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import { OfflineRegister } from "@/components/offline-register";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const SITIO_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "La Óptica",
    template: "%s · La Óptica",
  },
  description:
    "Tienda en línea de La Óptica: anteojos de sol, clip-ons, armazones y accesorios. Calidad y diseño para tu mirada.",
  metadataBase: new URL(SITIO_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "La Óptica",
    description:
      "Tienda en línea de La Óptica: anteojos de sol, clip-ons, armazones y accesorios.",
    type: "website",
    locale: "es_AR",
    siteName: "La Óptica",
    url: SITIO_URL,
  },
  twitter: {
    card: "summary",
    title: "La Óptica",
    description:
      "Anteojos de sol, clip-ons, armazones y accesorios. Calidad y diseño.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon-32.png",
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00848C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <OfflineRegister />
        <Toaster
          position="top-right"
          richColors={false}
          closeButton
          duration={3000}
          toastOptions={{
            style: {
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}