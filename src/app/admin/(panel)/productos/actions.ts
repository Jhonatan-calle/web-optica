"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { crearProductoFormSchema } from "@/lib/producto-schema";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoToggleEstado {
  ok: boolean;
  activo: boolean;
  error?: string;
}

export interface ResultadoCrearProducto {
  ok: boolean;
  productoId?: string;
  error?: string;
}

/**
 * Alterna el estado activo/pausado de un producto.
 *
 * Puerto de administración: solo usuarios con rol ADMIN pueden ejecutarla
 * (defensa en profundidad junto con el guard del middleware).
 */
export async function toggleEstadoProducto(
  id: string,
): Promise<ResultadoToggleEstado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  try {
    const producto = await prisma.producto.findUnique({
      where: { id },
      select: { activo: true },
    });

    if (!producto) {
      return { ok: false, activo: false, error: "Producto no encontrado." };
    }

    const nuevoActivo = !producto.activo;

    await prisma.producto.update({
      where: { id },
      data: { activo: nuevoActivo },
    });

    revalidatePath("/admin/productos");
    return { ok: true, activo: nuevoActivo };
  } catch (error) {
    console.error("Error al alternar estado del producto:", error);
    return {
      ok: false,
      activo: false,
      error: "No se pudo actualizar el estado. Intentá de nuevo.",
    };
  }
}

/**
 * Crea un producto con sus variantes e imágenes (escritura anidada.
 * Los precios se coercen a numbers por el schema; Prisma los recibe como
 * `number | string` y los guarda como Decimal.
 */
export async function crearProducto(
  input: unknown,
): Promise<ResultadoCrearProducto> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = crearProductoFormSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Producto inválido:", parsed.error.flatten());
    return { ok: false, error: "Revisá los datos del producto." };
  }

  const { nombre, slug, lineaId, descripcion, dimensiones, garantia, activo, destacado, variantes } =
    parsed.data;

  try {
    const producto = await prisma.producto.create({
      data: {
        nombre,
        slug,
        lineaId,
        descripcion,
        dimensiones,
        garantia,
        activo,
        destacado,
        variantes: {
          create: variantes.map((variante) => ({
            color: variante.color,
            material: variante.material,
            sku: variante.sku,
            precio: variante.precio,
            precioTransferencia: variante.precioTransferencia ?? null,
            stock: variante.stock,
            imagenes: {
              create: variante.imagenes.map((imagen, index) => ({
                url: imagen.url,
                alt: imagen.alt,
                orden: index,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/admin/productos");
    return { ok: true, productoId: producto.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: "Ya existe un producto con ese slug. Cambiá el slug e intentá de nuevo.",
      };
    }
    console.error("Error al crear producto:", error);
    return { ok: false, error: "Ocurrió un error al crear el producto." };
  }
}
