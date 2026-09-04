import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Óptica",
  description:
    "Tienda en línea de La Óptica: anteojos de sol, clip-ons, armazones y accesorios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnnouncementBar />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CartDrawer />
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
