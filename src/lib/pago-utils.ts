import type { CartItem } from "@/lib/cart-store";
import type { TipoPago } from "@/lib/checkout-schema";

export interface Totales {
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

export type ItemTotal = Pick<
  CartItem,
  "precio" | "cantidad" | "precioTransferencia"
>;

/**
 * Calcula los totales del pedido según el método de pago.
 *
 * - `transferencia`: aplica `precioTransferencia` por ítem (descuento
 *   automático). Ítems sin ese snapshot usan el precio completo.
 * - `online` / `efectivo_local`: usan `precio`.
 *
 * El costo de envío solo suma si se eligió envío a domicilio; con retiro en el
 * local es 0.
 */
export function calcularTotales(
  items: ItemTotal[],
  costoEnvio: number,
  metodoPago: TipoPago,
): Totales {
  const subtotal = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  let total;
  if (metodoPago === "transferencia") {
    total = items.reduce((acc, item) => {
      const precioConDescuento = item.precioTransferencia ?? item.precio;
      return acc + precioConDescuento * item.cantidad;
    }, 0);
  } else {
    total = subtotal;
  }

  const descuento = subtotal - total;
  const granTotal = total + costoEnvio;

  return { subtotal, descuento, costoEnvio, total: granTotal };
}