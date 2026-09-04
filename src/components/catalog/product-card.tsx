import Link from "next/link";
import { Plus } from "lucide-react";

import { useCartStore } from "@/lib/cart-store";
import type { MockProducto } from "@/lib/mock-products";
import { calcularBadge, calcularCuotas } from "@/lib/product-utils";
import { Button } from "@/components/ui/button";

export function ProductCard({ producto }: { producto: MockProducto }) {
  const addItem = useCartStore((state) => state.addItem);
  const variante = producto.variantes[0];
  const badge = calcularBadge(
    variante.precio,
    variante.precioTransferencia,
    producto.createdAt,
  );

  return (
    <div className="flex flex-col">
      <Link
        href={`/producto/${producto.slug}`}
        className="group relative block overflow-hidden rounded-lg"
      >
        <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] transition-colors group-hover:bg-brand-muted">
          <img
            src={variante.imagenes[0].url}
            alt={producto.nombre}
            className="h-16 w-auto opacity-80"
          />
        </div>
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-[#00848C] px-2 py-1 text-xs font-medium text-white">
            {badge}
          </span>
        )}
      </Link>

      <Link
        href={`/producto/${producto.slug}`}
        className="mt-3 line-clamp-1 text-sm font-medium hover:underline"
      >
        {producto.nombre}
      </Link>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-semibold">
          ${variante.precio.toLocaleString("es-AR")}
        </span>
        {variante.precioTransferencia && (
          <span className="text-xs font-medium text-[#00848C]">
            ${variante.precioTransferencia.toLocaleString("es-AR")} transferencia
          </span>
        )}
      </div>
      <span className="mt-0.5 text-xs text-muted-foreground">
        {calcularCuotas(variante.precio)}
      </span>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() =>
          addItem({
            varianteId: variante.id,
            productoId: producto.id,
            nombre: producto.nombre,
            color: variante.color,
            material: variante.material,
            precio: variante.precio,
            imagen: variante.imagenes[0].url,
            cantidad: 1,
          })
        }
      >
        <Plus />
        Agregar al Carrito
      </Button>
    </div>
  );
}
