import { z } from "zod";
import { esSlugValido } from "./slug-utils";

/** Campo opcional que en el form viene como string vacío "" (para inputs numéricos). */
const numericoOpcional = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().positive("Debe ser mayor a 0").optional(),
);

export const imagenFormSchema = z.object({
  url: z.string().min(1, "La URL de la imagen es obligatoria"),
  alt: z.string().optional(),
});

export const varianteFormSchema = z.object({
  color: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  material: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  sku: z
    .string()
    .max(64, "Máximo 64 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  precio: z.coerce.number().positive("Ingresá un precio mayor a 0"),
  precioTransferencia: numericoOpcional,
  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .default(0),
  imagenes: z.array(imagenFormSchema).default([]),
});

export const crearProductoFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "Ingresá el nombre del producto")
    .max(120, "Máximo 120 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .refine(esSlugValido, "Solo minúsculas, números y guiones"),
  lineaId: z.string().min(1, "Seleccioná una línea"),
  descripcion: z
    .string()
    .max(2000, "Máximo 2000 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  dimensiones: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  garantia: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  variantes: z
    .array(varianteFormSchema)
    .min(1, "Agregá al menos una variante"),
});

export type CrearProductoFormValues = z.output<
  typeof crearProductoFormSchema
>;
export type CrearProductoFormInput = z.input<typeof crearProductoFormSchema>;
export type VarianteFormValues = z.output<typeof varianteFormSchema>;
export type VarianteFormInput = z.input<typeof varianteFormSchema>;
export type ImagenFormValues = z.output<typeof imagenFormSchema>;
export type ImagenFormInput = z.input<typeof imagenFormSchema>;

/** Variante con id existente (para edición). */
export const varianteEditSchema = varianteFormSchema.extend({
  id: z.string().min(1).optional(),
});

/** Imagen con id existente (para edición). */
export const imagenEditSchema = imagenFormSchema.extend({
  id: z.string().min(1).optional(),
});

/** Schema de edición: mismo que crear pero con ids opcionales en variantes/imagenes. */
export const editarProductoFormSchema = crearProductoFormSchema.extend({
  variantes: z
    .array(
      varianteEditSchema.extend({
        imagenes: z.array(imagenEditSchema).default([]),
      }),
    )
    .min(1, "Agregá al menos una variante"),
});

export type EditarProductoFormValues = z.output<
  typeof editarProductoFormSchema
>;
export type EditarProductoFormInput = z.input<typeof editarProductoFormSchema>;
export type VarianteEditableFormValues = z.output<typeof varianteEditSchema>;
export type ImagenEditableFormValues = z.output<typeof imagenEditSchema>;