import Link from "next/link";
import { Plus } from "lucide-react";

import { useCartStore } from "@/lib/cart-store";
import type { MockProducto } from "@/lib/mock-products";
import { Button } from "@/components/ui/button";

export function ProductCard({ producto }: { producto: MockProducto }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="flex flex-col">
      <Link
        href={`/producto/${producto.slug}`}
        className="group relative block overflow-hidden rounded-lg"
      >
        <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] transition-colors group-hover:bg-brand-muted">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-16 w-auto opacity-80"
          />
        </div>
        {producto.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-[#00848C] px-2 py-1 text-xs font-medium text-white">
            {producto.badge}
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
          ${producto.precio.toLocaleString("es-AR")}
        </span>
        {producto.precioTransferencia && (
          <span className="text-xs font-medium text-[#00848C]">
            ${producto.precioTransferencia.toLocaleString("es-AR")} transferencia
          </span>
        )}
      </div>
      <span className="mt-0.5 text-xs text-muted-foreground">
        {producto.cuotas}
      </span>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() =>
          addItem({
            varianteId: producto.varianteId,
            productoId: producto.productoId,
            nombre: producto.nombre,
            color: producto.color,
            material: producto.material,
            precio: producto.precio,
            imagen: producto.imagen,
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
