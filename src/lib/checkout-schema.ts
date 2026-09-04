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

export type CheckoutDatos = z.infer<typeof checkoutSchema>;
