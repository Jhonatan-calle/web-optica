import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresá tu nombre completo"),
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginDatos = z.infer<typeof loginSchema>;
export type RegistroDatos = z.infer<typeof registroSchema>;