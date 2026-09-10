"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { crearOrden } from "@/app/(tienda)/checkout/actions";
import { CheckoutForm, CheckoutVacio } from "@/components/checkout/checkout-form";
import { EntregaForm } from "@/components/checkout/entrega-form";
import { PagoForm } from "@/components/checkout/pago-form";
import { ResumenOrden } from "@/components/checkout/resumen-orden";
import { generarPreferenciaPago } from "@/lib/mercadopago-cliente";
import { useCartStore, selectTotalCount } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { calcularTotales } from "@/lib/pago-utils";
import type { CheckoutDatos } from "@/lib/checkout-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PASOS = ["Datos", "Entrega", "Pago", "Confirmar"] as const;

interface CheckoutClienteProps {
  datosUsuario: CheckoutDatos | null;
}

export function CheckoutCliente({ datosUsuario }: CheckoutClienteProps) {
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
  const clearCarrito = useCartStore((state) => state.clear);

  const [creando, setCreando] = useState(false);
  const router = useRouter();

  const costoEnvio =
    entrega?.tipo === "envio" ? (entrega.costoEnvio ?? 0) : 0;
  const totales = useMemo(
    () => calcularTotales(items, costoEnvio, pago?.tipo ?? "online"),
    [items, costoEnvio, pago?.tipo],
  );

  const confirmarPedido = async () => {
    if (!datos || !entrega || !pago || count === 0) {
      toast.error("Faltan datos del pedido", {
        description: "Completá todos los pasos del checkout para continuar.",
      });
      return;
    }

    setCreando(true);
    try {
      const resultado = await crearOrden({ datos, entrega, pago, items });
      if (!resultado.ok) {
        toast.error("No se pudo crear el pedido", {
          description: resultado.error,
        });
        return;
      }
      clearCarrito();
      clearDatos();
      clearEntrega();
      clearPago();

      const ordenId = resultado.ordenId!;

      // Pago online: redirigir directo a Mercado Pago. Recién cuando el cliente
      // vuelve (o el webhook confirma) se muestra la pantalla de "Gracias".
      if (pago.tipo === "online") {
        const preferencia = await generarPreferenciaPago(ordenId);

        if (!preferencia.ok || !preferencia.initPoint) {
          toast.error("Tu pedido se guardó, pero no se pudo generar el pago", {
            description:
              preferencia.error ??
              "Intentalo de nuevo en unos minutos desde tu pedido.",
          });
          router.replace(`/orden/${ordenId}`);
          return;
        }

        window.location.href = preferencia.initPoint;
        return;
      }

      router.push(`/orden/${ordenId}`);
    } catch {
      toast.error("No se pudo crear el pedido", {
        description: "Ocurrió un error inesperado. Intentá de nuevo.",
      });
    } finally {
      setCreando(false);
    }
  };

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
              <CheckoutForm datosUsuario={datosUsuario} />
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
                Revisá que todo esté en orden antes de confirmar.
              </p>

              {datos && entrega && pago && (
                <ResumenOrden
                  datos={datos}
                  entrega={entrega}
                  pago={pago}
                  items={items}
                  totales={totales}
                />
              )}

              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={confirmarPedido}
                  disabled={creando}
                >
                  {creando && <Loader2 className="animate-spin" />}
                  {creando ? "Procesando pago…" : "Confirmar pedido"}
                </Button>
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