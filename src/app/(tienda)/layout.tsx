import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { createClient } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";

/**
 * Shell de la tienda pública (header, footer, carrito), aplicado a todas las
 * rutas de la tienda excepto `/admin`. El panel de administración usa su
 * propio layout (`src/app/admin/(panel)/layout.tsx`).
 */
export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? null;
  const isAdmin = esAdmin(user);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader userEmail={userEmail} isAdmin={isAdmin} />
      {children}
      <SiteFooter />
      <CartDrawer />
    </>
  );
}