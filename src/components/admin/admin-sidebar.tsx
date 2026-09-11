"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FormEvent } from "react";
import {
  LayoutDashboard,
  Layers,
  LogOut,
  Package,
  PackageSearch,
  Settings,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { cerrarSesion } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icono: LayoutDashboard,
    proximamente: false,
    exacto: true,
  },
  {
    label: "Órdenes",
    href: "/admin/ordenes",
    icono: Package,
    proximamente: false,
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icono: PackageSearch,
    proximamente: false,
  },
  {
    label: "Líneas",
    href: "/admin/lineas",
    icono: Layers,
    proximamente: false,
  },
  {
    label: "Configuración",
    href: "/admin/configuracion",
    icono: Settings,
    proximamente: false,
  },
];

/**
 * Sidebar del panel admin (Client Component): usa usePathname para marcar el
 * item activo según la ruta actual. Se renderiza dentro del layout del grupo
 * `(panel)`.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  const esActivo = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.proximamente) return false;
    if ("exacto" in item && item.exacto) return item.href === pathname;
    return pathname.startsWith(item.href);
  };

  return (
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
          const activo = esActivo(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.proximamente ? "Próximamente" : undefined}
              aria-disabled={item.proximamente || undefined}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                item.proximamente
                  ? "pointer-events-none opacity-50"
                  : activo
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
        <div className="mb-2 border-t border-border" />
        <Link
          href="/"
          title="Volver a la tienda"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Store className="size-4 shrink-0" aria-hidden="true" />
          Ver tienda
        </Link>
        <form
          onSubmit={async (evento: FormEvent<HTMLFormElement>) => {
            evento.preventDefault();
            try {
              await cerrarSesion();
            } catch (error) {
              // El `redirect` de la Server Action no debe tratarse como error.
              if (isRedirectError(error)) throw error;
              toast.error("No se pudo cerrar la sesión", {
                description: "Intentá de nuevo en unos minutos.",
              });
            }
          }}
        >
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
  );
}
