"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ImagenStore } from "@/components/ui/imagen-store";
import { useCartCount } from "@/hooks/use-cart-count";
import { UserMenu } from "@/components/user-menu";

// Los filtros por tipo usan el nombre exacto del Tipo en BD (`linea.tipo.nombre`).
// Verificar/crear esos Tipos en el panel `/admin/lineas` para que los links
// muestren resultados; hoy caen en el estado vacío amigable del catálogo.
const NAV_LINKS = [
  { label: "Líneas", href: "/catalogo" },
  { label: "Anteojos de Sol", href: "/catalogo?tipo=Anteojo de Sol" },
  { label: "Clip-ons", href: "/catalogo?tipo=Clip-on" },
  { label: "Accesorios", href: "/catalogo?tipo=Accesorios" },
];

interface SiteHeaderProps {
  userEmail: string | null;
  isAdmin: boolean;
}

export function SiteHeader({ userEmail, isAdmin }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const setCartOpen = useCartStore((state) => state.setOpen);
  const { count, hasHydrated } = useCartCount();

  return (
    <header className="sticky top-8 z-40 w-full shrink-0 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <ImagenStore
              src="/isologo.svg"
              alt="La Óptica"
              className="h-8 w-auto object-contain"
              width={218}
              height={40}
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              render={<Link href={link.href} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buscar"
            className="text-muted-foreground"
          >
            <Search />
          </Button>
          <UserMenu userEmail={userEmail} isAdmin={isAdmin} />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir carrito"
            className="relative text-muted-foreground"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart />
            {hasHydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "border-t bg-background md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 p-2" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              render={<Link href={link.href} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
