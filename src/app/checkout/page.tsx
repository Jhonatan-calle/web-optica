"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, PackageCheck, Truck } from "lucide-react";

import { CheckoutForm, CheckoutVacio } from "@/components/checkout/checkout-form";
import { EntregaForm } from "@/components/checkout/entrega-form";
import { useCartStore, selectTotalCount } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { DIRECCION_LOCAL } from "@/lib/tienda-info";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PASOS = ["Datos", "Entrega", "Pago"] as const;
type PasoIndex = number;

export default function CheckoutPage() {
  const count = useCartStore(selectTotalCount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const datos = useCheckoutStore((state) => state.datos);
  const entrega = useCheckoutStore((state) => state.entrega);
  const clearEntrega = useCheckoutStore((state) => state.clearEntrega);
  const clearDatos = useCheckoutStore((state) => state.clearDatos);

  const [paso, setPaso] = useState<PasoIndex>(() =>
    !datos ? 0 : !entrega ? 1 : 2,
  );

  useEffect(() => {
    const unsubscribe = useCheckoutStore.subscribe((state, prev) => {
      if (!prev.datos && state.datos) {
        setPaso(1);
        return;
      }
      if (!prev.entrega && state.entrega) {
        setPaso(2);
      }
    });
    return unsubscribe;
  }, []);

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
                          "h-px w-6",
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
                      {label}
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
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                El siguiente paso (pago) llega pronto.
              </p>

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
                    <p className="mt-1 text-muted-foreground">
                      Costo de envío:{" "}
                      <span className="font-semibold text-foreground">
                        ${(entrega.costoEnvio ?? 0).toLocaleString("es-AR")}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="font-medium">Retiro en el local (gratis)</p>
                    <p className="text-muted-foreground">{DIRECCION_LOCAL}</p>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setPaso(1)}
              >
                <ArrowLeft />
                Volver a elegir entrega
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
                  clearEntrega();
                  setPaso(0);
                }}
              >
                Editar datos de contacto
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}