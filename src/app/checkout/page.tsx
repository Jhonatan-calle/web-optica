"use client";

import { CheckoutForm, CheckoutVacio } from "@/components/checkout/checkout-form";
import { useCartStore, selectTotalCount } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";

export default function CheckoutPage() {
  const count = useCartStore(selectTotalCount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const datosGuardados = useCheckoutStore((state) => state.datos);

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
      <p className="mb-8 text-sm text-muted-foreground">
        Ingresá tus datos de contacto para continuar.
      </p>

      {count === 0 ? (
        <CheckoutVacio />
      ) : (
        <>
          {datosGuardados && (
            <p className="mb-4 rounded-lg border border-brand/30 bg-brand-muted px-3 py-2 text-xs text-foreground">
              Ya tenés datos guardados de una visita anterior. Podés actualizarlos.
            </p>
          )}
          <CheckoutForm />
        </>
      )}
    </main>
  );
}
