import { z } from "zod";

/** Configuración global de la tienda, editable desde el panel admin. */
export const configuracionSchema = z.object({
  cuotasCantidad: z
    .coerce
    .number()
    .int("Ingresá un número entero")
    .min(1, "Mínimo 1 cuota")
    .max(12, "Máximo 12 cuotas"),
  cuotasConInteres: z.boolean(),
  diasProductoNuevo: z
    .coerce
    .number()
    .int("Ingresá un número entero")
    .min(1, "Mínimo 1 día")
    .max(365, "Máximo 365 días"),
});

export type ConfiguracionFormValues = z.output<typeof configuracionSchema>;
export type ConfiguracionFormInput = z.input<typeof configuracionSchema>;