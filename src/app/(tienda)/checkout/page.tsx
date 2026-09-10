import { obtenerDatosContactoUsuario } from "./actions";
import { CheckoutCliente } from "@/components/checkout/checkout-page";

export default async function CheckoutPage() {
  // Los datos de contacto del usuario logueado se resuelven acá (servidor) y
  // se pasan al formulario como prop: el HTML ya llega precargado, sin flicker.
  const datosUsuario = await obtenerDatosContactoUsuario();

  return <CheckoutCliente datosUsuario={datosUsuario} />;
}