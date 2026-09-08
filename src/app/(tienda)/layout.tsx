import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

/**
 * Shell de la tienda pública (header, footer, carrito), aplicado a todas las
 * rutas de la tienda excepto `/admin`. El panel de administración usa su
 * propio layout (`src/app/admin/(panel)/layout.tsx`).
 */
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
    </>
  );
}