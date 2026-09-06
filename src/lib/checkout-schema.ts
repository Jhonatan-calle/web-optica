import { z } from "zod";

export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  nombre: z
    .string()
    .min(2, "Ingresá tu nombre completo"),
  telefono: z
    .string()
    .min(1, "Ingresá tu teléfono")
    .regex(/^[0-9+\s-]{10,}$/, "Ingresá un teléfono válido"),
  dni: z
    .string()
    .min(1, "Ingresá tu DNI")
    .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"),
});

export const envioSchema = z.object({
  tipo: z.literal("envio"),
  calle: z.string().min(3, "Ingresá la calle"),
  numero: z.string().min(1, "Ingresá el número"),
  departamento: z.string().optional(),
  ciudad: z.string().min(2, "Ingresá la ciudad"),
  provincia: z.string().min(2, "Ingresá la provincia"),
  codigoPostal: z
    .string()
    .regex(/^\d{4}$/, "Ingresá un CP válido de 4 dígitos"),
});

export const retiroSchema = z.object({
  tipo: z.literal("retiro"),
});

export const entregaSchema = z.discriminatedUnion("tipo", [
  envioSchema,
  retiroSchema,
]);

export type EntregaDatos = z.infer<typeof entregaSchema>;
export type TipoEntrega = EntregaDatos["tipo"];

export const pagoSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("online") }),
  z.object({ tipo: z.literal("transferencia") }),
  z.object({ tipo: z.literal("efectivo_local") }),
]);

export type PagoDatos = z.infer<typeof pagoSchema>;
export type TipoPago = PagoDatos["tipo"];

export interface PagoFormValues {
  tipo: TipoPago;
}

export type CheckoutDatos = z.infer<typeof checkoutSchema>;

/**
 * Valores que maneja el formulario de entrega (superset de `EntregaDatos`):
 * permite tipar react-hook-form con todas las opciones del union a la vez.
 */
export interface EntregaFormValues {
  tipo: TipoEntrega;
  calle: string;
  numero: string;
  departamento: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}