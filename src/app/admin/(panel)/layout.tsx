import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  Package,
  PackageSearch,
} from "lucide-react";

import { cerrarSesion } from "../actions";
import { cn } from "@/lib/utils";

/** El panel depende de la sesión (cookies): siempre render dinámico. */
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icono: LayoutDashboard,
    activo: true,
    proximamente: false,
  },
  {
    label: "Órdenes",
    href: "/admin/ordenes",
    icono: Package,
    activo: false,
    proximamente: true,
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icono: PackageSearch,
    activo: false,
    proximamente: true,
  },
];

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
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-sidebar px-3 py-5 text-sidebar-foreground">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-2 font-medium"
        >
          <Image
            src="/isologo.svg"
            alt="La Óptica"
            width={218}
            height={40}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <p className="mt-8 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Menú
        </p>

        <nav className="mt-2 flex flex-col gap-1" aria-label="Panel admin">
          {NAV_ITEMS.map((item) => {
            const Icono = item.icono;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.proximamente ? "Próximamente" : undefined}
                aria-disabled={item.proximamente || undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  item.proximamente
                    ? "pointer-events-none opacity-50"
                    : item.activo
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icono className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
                {item.proximamente ? (
                  <span className="ml-auto text-[0.65rem] text-muted-foreground">
                    pronto
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex w-full min-h-screen flex-col pl-60">
        <main className="flex-1 bg-muted/40 px-6 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}