"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCartStore, selectSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore(selectSubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
          <SheetDescription className="sr-only">
            Resumen de productos en tu carrito de compras
          </SheetDescription>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit text-muted-foreground"
              onClick={clear}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Vaciar
            </Button>
          )}
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Tu carrito está vacío
              </p>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/catalogo" />}
                nativeButton={false}
                onClick={() => setOpen(false)}
              >
                Explorar Catálogo
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-lg border p-3"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#F9FAFB]">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.nombre}
                      </p>
                      {(item.color || item.material) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[item.color, item.material]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground"
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      ${item.precio.toLocaleString("es-AR")}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          updateQuantity(item.id, item.cantidad - 1)
                        }
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {item.cantidad}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          updateQuantity(item.id, item.cantidad + 1)
                        }
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-base font-semibold">
                ${subtotal.toLocaleString("es-AR")}
              </span>
            </div>
            <Button
              className="w-full"
              render={<Link href="/checkout" />}
              nativeButton={false}
              onClick={() => setOpen(false)}
            >
              Finalizar Compra
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
