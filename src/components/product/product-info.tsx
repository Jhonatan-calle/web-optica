"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import type { MockProducto, MockVariante } from "@/lib/mock-products";
import { calcularBadge, calcularCuotas } from "@/lib/product-utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { showAddToCartToast } from "@/components/cart/add-to-cart-toast";

const TARIFAS_ENVIO = [
  { rango: "CABA y GBA", minimo: 1000, maximo: 1999, precio: 4500 },
  { rango: "Provincia de Buenos Aires", minimo: 2000, maximo: 6499, precio: 6200 },
  { rango: "Centro del país", minimo: 6500, maximo: 9999, precio: 7800 },
  { rango: "Resto del país", minimo: 10000, maximo: 99999, precio: 8900 },
];

export function ProductInfo({ producto }: { producto: MockProducto }) {
  const addItem = useCartStore((state) => state.addItem);
  const setOpen = useCartStore((state) => state.setOpen);

  const [varianteActivaId, setVarianteActivaId] = useState(
    producto.variantes[0]?.id,
  );
  const [cp, setCp] = useState("");
  const [cotizado, setCotizado] = useState<number | null>(null);

  const varianteActiva = useMemo<MockVariante>(
    () =>
      producto.variantes.find((v) => v.id === varianteActivaId) ??
      producto.variantes[0],
    [producto, varianteActivaId],
  );

  const badge = calcularBadge(
    varianteActiva.precio,
    varianteActiva.precioTransferencia,
    producto.createdAt,
  );

  const calcularEnvio = () => {
    const cpNum = parseInt(cp.replace(/\D/g, ""), 10);
    if (!cpNum || String(cpNum).length !== 4) {
      setCotizado(-1);
      return;
    }
    const tarifa = TARIFAS_ENVIO.find(
      (t) => cpNum >= t.minimo && cpNum <= t.maximo,
    );
    setCotizado(tarifa ? tarifa.precio : 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {producto.linea.nombre} · {producto.linea.tipo.nombre}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          {producto.nombre}
        </h1>
        {badge && (
          <span className="mt-3 inline-block rounded-full bg-[#00848C] px-2 py-1 text-xs font-medium text-white">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold">
            ${varianteActiva.precio.toLocaleString("es-AR")}
          </span>
          {varianteActiva.precioTransferencia && (
            <span className="text-sm font-medium text-[#00848C]">
              ${varianteActiva.precioTransferencia.toLocaleString("es-AR")} transferencia
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {calcularCuotas(varianteActiva.precio)}
        </span>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Color / Material</h2>
        <div className="flex flex-wrap gap-2">
          {producto.variantes.map((variante) => {
            const activo = variante.id === varianteActivaId;
            return (
              <button
                key={variante.id}
                type="button"
                onClick={() => setVarianteActivaId(variante.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activo
                    ? "border-[#00848C] bg-[#00848C] text-white"
                    : "border-border bg-background text-foreground hover:border-muted-foreground/40",
                )}
              >
                {variante.color} · {variante.material}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Seleccionado: {varianteActiva.color} · {varianteActiva.material}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Envío</h2>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Código postal"
            value={cp}
            onChange={(e) => {
              setCp(e.target.value);
              setCotizado(null);
            }}
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" onClick={calcularEnvio}>
            Calcular
          </Button>
        </div>
        <div className="mt-3 min-h-6 text-sm">
          {cotizado === -1 && (
            <p className="text-[#B91C1C]">
              Ingresá un código postal válido de 4 dígitos.
            </p>
          )}
          {cotizado === 0 && (
            <p className="text-muted-foreground">
              No encontramos envío para ese código postal. Consultanos por
              WhatsApp.
            </p>
          )}
          {cotizado && cotizado > 0 && (
            <p className="text-muted-foreground">
              Envío estimado a todo el país:{" "}
              <span className="font-semibold text-foreground">
                ${cotizado.toLocaleString("es-AR")}
              </span>
            </p>
          )}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          addItem({
            varianteId: varianteActiva.id,
            productoId: producto.id,
            nombre: producto.nombre,
            color: varianteActiva.color,
            material: varianteActiva.material,
            precio: varianteActiva.precio,
            imagen: varianteActiva.imagenes[0]?.url,
            cantidad: 1,
          });
          setOpen(true);
          showAddToCartToast(producto.nombre);
        }}
      >
        <Plus />
        Agregar al Carrito
      </Button>

      <Accordion multiple>
        <AccordionItem value="dimensiones">
          <AccordionTrigger>Dimensiones</AccordionTrigger>
          <AccordionContent>
            <p>{producto.dimensiones}</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="materiales">
          <AccordionTrigger>Materiales</AccordionTrigger>
          <AccordionContent>
            <p>
              Armazón fabricado en {varianteActiva.material.toLowerCase()} de
              alta calidad. Cristales con protección UV según línea.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="garantia">
          <AccordionTrigger>Garantía</AccordionTrigger>
          <AccordionContent>
            <p>{producto.garantia}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
