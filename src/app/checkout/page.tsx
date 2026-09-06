"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  Landmark,
  PackageCheck,
  Truck,
} from "lucide-react";

import { CheckoutForm, CheckoutVacio } from "@/components/checkout/checkout-form";
import { EntregaForm } from "@/components/checkout/entrega-form";
import { PagoForm } from "@/components/checkout/pago-form";
import { useCartStore, selectTotalCount } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { calcularTotales } from "@/lib/pago-utils";
import { DIRECCION_LOCAL } from "@/lib/tienda-info";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PASOS = ["Datos", "Entrega", "Pago", "Confirmar"] as const;

export default function CheckoutPage() {
  const count = useCartStore(selectTotalCount);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const datos = useCheckoutStore((state) => state.datos);
  const entrega = useCheckoutStore((state) => state.entrega);
  const pago = useCheckoutStore((state) => state.pago);
  const clearDatos = useCheckoutStore((state) => state.clearDatos);
  const clearEntrega = useCheckoutStore((state) => state.clearEntrega);
  const clearPago = useCheckoutStore((state) => state.clearPago);
  const paso = useCheckoutStore((state) => state.paso);
  const setPaso = useCheckoutStore((state) => state.setPaso);

  const costoEnvio =
    entrega?.tipo === "envio" ? (entrega.costoEnvio ?? 0) : 0;
  const totales = useMemo(
    () => calcularTotales(items, costoEnvio, pago?.tipo ?? "online"),
    [items, costoEnvio, pago?.tipo],
  );

  if (!hasHydrated) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight md:text-3xl">
        Checkout
      </h1>

      {count === 0 ? (
        <CheckoutVacio />
      ) : (
        <>
          <div className="mb-8 mt-6">
            <ul className="flex items-center justify-center gap-2">
              {PASOS.map((label, i) => {
                const activo = i === paso;
                const completado = i < paso;
                return (
                  <li key={label} className="flex items-center gap-2">
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-px w-5 md:w-6",
                          i <= paso ? "bg-[#00848C]" : "bg-border",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        activo
                          ? "text-[#00848C]"
                          : completado
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                          activo
                            ? "border-[#00848C] bg-[#00848C] text-white"
                            : completado
                              ? "border-[#00848C]/40 bg-[#00848C]/10 text-[#00848C]"
                              : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        {completado ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="hidden sm:inline">{label}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {paso === 0 && (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                Ingresá tus datos de contacto para continuar.
              </p>
              {datos && (
                <p className="mb-4 rounded-lg border border-brand/30 bg-brand-muted px-3 py-2 text-xs text-foreground">
                  Ya tenés datos guardados de una visita anterior. Podés
                  actualizarlos.
                </p>
              )}
              <CheckoutForm />
            </>
          )}

          {paso === 1 && (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                Elegí cómo querés recibir tu pedido.
              </p>
              <EntregaForm />
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setPaso(0)}
              >
                <ArrowLeft />
                Volver a mis datos
              </Button>
            </>
          )}

          {paso === 2 && (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                Elegí cómo querés pagar.
              </p>
              <PagoForm />
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setPaso(1)}
              >
                <ArrowLeft />
                Volver a elegir entrega
              </Button>
            </>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Confirmación del pedido: llega pronto (próximo paso: generar la
                orden en la base de datos).
              </p>

              {datos && (
                <div className="rounded-xl border border-border p-4">
                  <h2 className="mb-2 text-sm font-semibold">
                    Datos de contacto
                  </h2>
                  <p className="text-sm">
                    {datos.nombre} · {datos.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {datos.telefono} · DNI {datos.dni}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  {entrega?.tipo === "envio" ? (
                    <Truck className="h-4 w-4 text-[#00848C]" />
                  ) : (
                    <PackageCheck className="h-4 w-4 text-[#00848C]" />
                  )}
                  Método de entrega
                </h2>
                {entrega?.tipo === "envio" ? (
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="font-medium">
                      Envío a domicilio · {entrega.calle} {entrega.numero}
                      {entrega.departamento ? `, ${entrega.departamento}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {entrega.ciudad}, {entrega.provincia} · CP{" "}
                      {entrega.codigoPostal}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="font-medium">Retiro en el local (gratis)</p>
                    <p className="text-muted-foreground">{DIRECCION_LOCAL}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  {pago?.tipo === "online" ? (
                    <CreditCard className="h-4 w-4 text-[#00848C]" />
                  ) : pago?.tipo === "transferencia" ? (
                    <Landmark className="h-4 w-4 text-[#00848C]" />
                  ) : (
                    <Banknote className="h-4 w-4 text-[#00848C]" />
                  )}
                  Método de pago
                </h2>
                <p className="text-sm">
                  {pago?.tipo === "online" &&
                    "Pago online (Mercado Pago, se conecta en Fase 3)"}
                  {pago?.tipo === "transferencia" && "Transferencia bancaria"}
                  {pago?.tipo === "efectivo_local" &&
                    "Efectivo al retirar en el local"}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${totales.subtotal.toLocaleString("es-AR")}
                  </span>
                </div>
                {totales.descuento > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#00848C]">
                      Descuento transferencia
                    </span>
                    <span className="font-medium text-[#00848C]">
                      −${totales.descuento.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Costo de envío</span>
                  <span className="font-medium">
                    {costoEnvio > 0
                      ? `$${costoEnvio.toLocaleString("es-AR")}`
                      : "Gratis"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ${totales.total.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setPaso(2)}
                >
                  <ArrowLeft />
                  Volver a pagar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    clearPago();
                    setPaso(2);
                  }}
                >
                  Cambiar método de pago
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    clearEntrega();
                    setPaso(1);
                  }}
                >
                  Cambiar método de entrega
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    clearDatos();
                    setPaso(0);
                  }}
                >
                  Editar datos de contacto
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}