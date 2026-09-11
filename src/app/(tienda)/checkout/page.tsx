import { Suspense } from "react";

import { obtenerDatosContactoUsuario } from "./actions";
import { CheckoutCliente } from "@/components/checkout/checkout-page";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";

async function DatosCheckout() {
  // Los datos de contacto del usuario logueado se resuelven acá (servidor) y
  // se pasan al formulario como prop: el HTML ya llega precargado, sin flicker.
  const datosUsuario = await obtenerDatosContactoUsuario();

  return <CheckoutCliente datosUsuario={datosUsuario} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <DatosCheckout />
    </Suspense>
  );
}