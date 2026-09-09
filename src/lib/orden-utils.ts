import { z } from "zod";

import {
  checkoutSchema,
  envioSchema,
  entregaSchema,
  pagoSchema,
  retiroSchema,
} from "@/lib/checkout-schema";
import { EstadoOrden, MetodoEnvio, MetodoPago } from "@/generated/prisma/enums";

/** Los 7 estados posibles de una orden (el enum Prisma es la fuente de verdad). */
export const ESTADOS_ORDEN: EstadoOrden[] = [
  EstadoOrden.PENDIENTE,
  EstadoOrden.PAGADO,
  EstadoOrden.EN_PREPARACION,
  EstadoOrden.DESPACHADO,
  EstadoOrden.LISTO_PARA_RETIRAR,
  EstadoOrden.ENTREGADO,
  EstadoOrden.CANCELADO,
];

/** Etiqueta legible por estado (para badges y selects). */
export const ETIQUETAS_ESTADO: Record<EstadoOrden, string> = {
  [EstadoOrden.PENDIENTE]: "Pendiente",
  [EstadoOrden.PAGADO]: "Pagado",
  [EstadoOrden.EN_PREPARACION]: "En preparación",
  [EstadoOrden.DESPACHADO]: "Despachado",
  [EstadoOrden.LISTO_PARA_RETIRAR]: "Listo para retirar",
  [EstadoOrden.ENTREGADO]: "Entregado",
  [EstadoOrden.CANCELADO]: "Cancelado",
};

/** Clases de color para el badge de estado (estilo tint + texto). */
export const CLASES_COLOR_ESTADO: Record<EstadoOrden, string> = {
  [EstadoOrden.PENDIENTE]: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  [EstadoOrden.PAGADO]: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  [EstadoOrden.EN_PREPARACION]:
    "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  [EstadoOrden.DESPACHADO]: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  [EstadoOrden.LISTO_PARA_RETIRAR]:
    "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  [EstadoOrden.ENTREGADO]:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  [EstadoOrden.CANCELADO]: "bg-red-500/10 text-red-700 dark:text-red-400",
};

/** Etiqueta legible por método de pago. */
export const ETIQUETAS_PAGO: Record<MetodoPago, string> = {
  [MetodoPago.MERCADO_PAGO]: "Online",
  [MetodoPago.TRANSFERENCIA]: "Transferencia",
  [MetodoPago.PAGO_EN_LOCAL]: "Efectivo en local",
};

/** Etiqueta legible por método de envío/entrega. */
export const ETIQUETAS_ENVIO: Record<MetodoEnvio, string> = {
  [MetodoEnvio.CORREO_ARGENTINO]: "Correo Argentino",
  [MetodoEnvio.ANDREANI]: "Andreani",
  [MetodoEnvio.OCA]: "OCA",
  [MetodoEnvio.SHIPNOW]: "Shipnow",
  [MetodoEnvio.ENVIO_PROPIO]: "Envío propio",
  [MetodoEnvio.RETIRO_LOCAL]: "Retiro en local",
};

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