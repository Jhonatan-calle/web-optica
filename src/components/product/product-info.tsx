"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import type { ProductoPublico, VariantePublica } from "@/lib/catalog-types";
import type { ConfigCuotas } from "@/lib/product-utils";
import { calcularBadge, calcularCuotas } from "@/lib/product-utils";
import { cotizarEnvioPublico } from "@/app/(tienda)/checkout/actions";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { showAddToCartToast } from "@/components/cart/add-to-cart-toast";

export function ProductInfo({
  producto,
  configCuotas,
  diasNuevo,
}: {
  producto: ProductoPublico;
  configCuotas: ConfigCuotas;
  diasNuevo: number;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const setOpen = useCartStore((state) => state.setOpen);

  const [varianteActivaId, setVarianteActivaId] = useState(
    producto.variantes[0]?.id,
  );
  const [cp, setCp] = useState("");
  const [cotizado, setCotizado] = useState<
    | { estado: "invalido" }
    | { estado: "ok"; precio: number; dias: number | null }
    | { estado: "contingencia"; precio: number }
    | null
  >(null);
  const [cotizando, setCotizando] = useState(false);

  const varianteActiva = useMemo<VariantePublica>(
    () =>
      producto.variantes.find((v) => v.id === varianteActivaId) ??
      producto.variantes[0],
    [producto, varianteActivaId],
  );

  const badge = calcularBadge(
    varianteActiva.precio,
    varianteActiva.precioTransferencia,
    producto.createdAt,
    diasNuevo,
  );

  const materiales = useMemo(
    () =>
      [
        ...new Set(
          producto.variantes
            .map((variante) => variante.material)
            .filter((m): m is string => Boolean(m)),
        ),
      ],
    [producto],
  );

  const calcularEnvio = async () => {
    setCotizando(true);
    try {
      const resultado = await cotizarEnvioPublico(cp, 1);
      if (resultado.estado === "invalido") {
        setCotizado({ estado: "invalido" });
        return;
      }
      setCotizado({
        estado: resultado.estado,
        precio: resultado.precio ?? 0,
        dias: resultado.dias ?? null,
      });
    } catch {
      setCotizado({ estado: "invalido" });
    } finally {
      setCotizando(false);
    }
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
          {calcularCuotas(varianteActiva.precio, configCuotas)}
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
          <Button type="button" onClick={calcularEnvio} disabled={cotizando}>
            {cotizando && <Loader2 className="animate-spin" />}
            {cotizando ? "Cotizando…" : "Calcular"}
          </Button>
        </div>
        <div className="mt-3 min-h-6 text-sm">
          {cotizado?.estado === "invalido" && (
            <p className="text-[#B91C1C]">
              Ingresá un código postal válido de 4 dígitos.
            </p>
          )}
          {cotizado?.estado === "ok" && (
            <p className="text-muted-foreground">
              Envío estimado a todo el país:{" "}
              <span className="font-semibold text-foreground">
                ${cotizado.precio.toLocaleString("es-AR")}
              </span>
              {cotizado.dias != null
                ? ` · ${cotizado.dias} día${cotizado.dias === 1 ? "" : "s"} hábiles`
                : ""}
            </p>
          )}
          {cotizado?.estado === "contingencia" && (
            <p className="text-muted-foreground">
              Envío Nacional Estándar:{" "}
              <span className="font-semibold text-foreground">
                ${cotizado.precio.toLocaleString("es-AR")}
              </span>{" "}
              <span className="text-xs">(tarifa provisional)</span>
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
            precioTransferencia: varianteActiva.precioTransferencia,
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
            {materiales.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {materiales.map((material) => (
                  <li key={material}>{material}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No especificamos los materiales de este producto. Consultanos
                por WhatsApp.
              </p>
            )}
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
