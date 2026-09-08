import { AdminSidebar } from "@/components/admin/admin-sidebar";

/** El panel depende de la sesión (cookies): siempre render dinámico. */
export const dynamic = "force-dynamic";

/**
 * Shell del panel de administración: barra lateral fija con navegación y
 * cierre de sesión. Solo aplica a `/admin` (no a `/admin/login`, que vive
 * fuera del grupo `(panel)` y usa el layout raíz).
 */
export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex w-full min-h-screen flex-col pl-60">
        <main className="flex-1 bg-muted/40 px-6 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
