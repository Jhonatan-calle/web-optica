import { z } from "zod";

import { EstadoOrden } from "@/generated/prisma/enums";

/**
 * Payload para actualizar el estado de una orden desde el panel admin.
 *
 * El tracking puede venir vacío ("") y se normaliza a `null` en el servidor.
 * La validación de "DESPACHADO exige tracking para envíos por correo" se hace
 * en la Server Action (no solo en el cliente).
 */
export const estadoOrdenSchema = z.object({
  estado: z.nativeEnum(EstadoOrden),
  trackingNumber: z
    .string()
    .trim()
    .max(50, "El código de seguimiento es muy largo (máx 50 caracteres)")
    .transform((valor) => (valor === "" ? null : valor)),
});

export type EstadoOrdenInput = z.infer<typeof estadoOrdenSchema>;