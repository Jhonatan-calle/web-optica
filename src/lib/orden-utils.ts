import { z } from "zod";

import {
  checkoutSchema,
  envioSchema,
  entregaSchema,
  pagoSchema,
  retiroSchema,
} from "@/lib/checkout-schema";
import { MetodoEnvio, MetodoPago } from "@/generated/prisma/enums";

/**
 * Mapea el método de pago de la UI (checkout) al enum de la base de datos.
 */
export function mapMetodoPago(
  tipo: z.infer<typeof pagoSchema>["tipo"],
): (typeof MetodoPago)[keyof typeof MetodoPago] {
  switch (tipo) {
    case "online":
      return MetodoPago.MERCADO_PAGO;
    case "transferencia":
      return MetodoPago.TRANSFERENCIA;
    case "efectivo_local":
      return MetodoPago.PAGO_EN_LOCAL;
  }
}

/**
 * Mapea el método de entrega de la UI al enum de la base de datos.
 *
 * El envío a domicilio se guarda como `ENVIO_PROPIO` (logística local de La
 * Óptica) hasta que la tarea B5 defina el transportista/API de tarifas real.
 */
export function mapMetodoEnvio(
  tipo: z.infer<typeof entregaSchema>["tipo"],
): (typeof MetodoEnvio)[keyof typeof MetodoEnvio] {
  return tipo === "retiro" ? MetodoEnvio.RETIRO_LOCAL : MetodoEnvio.ENVIO_PROPIO;
}

/** Ítem del carrito tal como viaja al servidor al confirmar el pedido. */
export const itemOrdenSchema = z.object({
  varianteId: z.string().min(1),
  productoId: z.string().min(1),
  nombre: z.string().min(1).max(255),
  color: z.string().optional(),
  precio: z.number().nonnegative(),
  precioTransferencia: z.number().nonnegative().optional(),
  cantidad: z.number().int().min(1).max(99),
  imagen: z.string().optional(),
});

/**
 * Entrega tal como la persiste el checkout: el `costoEnvio` es un campo extra
 * del store (no vive en `entregaSchema`), presente solo con envío a domicilio.
 */
export const entregaOrdenSchema = z.discriminatedUnion("tipo", [
  envioSchema.extend({ costoEnvio: z.number().nonnegative().optional() }),
  retiroSchema.extend({ costoEnvio: z.number().nonnegative().optional() }),
]);

/** Payload completo de la Server Action `crearOrden`. */
export const crearOrdenSchema = z.object({
  datos: checkoutSchema,
  entrega: entregaOrdenSchema,
  pago: pagoSchema,
  items: z.array(itemOrdenSchema).min(1),
});

export type CrearOrdenInput = z.infer<typeof crearOrdenSchema>;