import { z } from "zod";

/** Formulario de alta/edición de una Línea (colección) del catálogo. */
export const lineaFormSchema = z.object({
  tipoId: z.string().min(1, "Seleccioná un tipo"),
  nombre: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre de la línea")
    .max(80, "Máximo 80 caracteres"),
  descripcion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  imagenUrl: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().url("Ingresá una URL válida").optional(),
  ),
});

/** Formulario de alta/edición de un Tipo (agrupación de líneas). */
export const tipoFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre del tipo")
    .max(40, "Máximo 40 caracteres"),
});

export type LineaFormValues = z.output<typeof lineaFormSchema>;
export type LineaFormInput = z.input<typeof lineaFormSchema>;
export type TipoFormValues = z.output<typeof tipoFormSchema>;
export type TipoFormInput = z.input<typeof tipoFormSchema>;