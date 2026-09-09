"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { crearProductoFormSchema, editarProductoFormSchema } from "@/lib/producto-schema";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { borrarImagenSupabase } from "@/lib/upload-utils";

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

export interface ResultadoEditarProducto {
  ok: boolean;
  error?: string;
}

export interface ResultadoEliminarProducto {
  ok: boolean;
  error?: string;
}

export interface ProductoAdminVariante {
  id: string;
  color: string | null;
  material: string | null;
  sku: string | null;
  precio: number;
  precioTransferencia: number | null;
  stock: number;
  imagenes: { id: string; url: string; alt?: string }[];
}

export interface ProductoAdmin {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  dimensiones: string | null;
  garantia: string | null;
  activo: boolean;
  destacado: boolean;
  lineaId: string;
  variantes: ProductoAdminVariante[];
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

/**
 * Obtiene un producto completo (con variantes e imágenes) para el form de edición.
 */
export async function obtenerProductoAdmin(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
      dimensiones: true,
      garantia: true,
      activo: true,
      destacado: true,
      lineaId: true,
      variantes: {
        select: {
          id: true,
          color: true,
          material: true,
          sku: true,
          precio: true,
          precioTransferencia: true,
          stock: true,
          imagenes: {
            select: { id: true, url: true, alt: true, orden: true },
            orderBy: { orden: "asc" },
          },
        },
      },
    },
  });

  if (!producto) return null;

  return {
    ...producto,
    variantes: producto.variantes.map((v) => ({
      ...v,
      precio: Number(v.precio),
      precioTransferencia:
        v.precioTransferencia !== null ? Number(v.precioTransferencia) : null,
      imagenes: v.imagenes.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt ?? undefined,
      })),
    })),
  };
}

/**
 * Actualiza un producto con sus variantes e imágenes.
 *
 * Flujo transaccional:
 * 1. Transacción Prisma: actualizar producto, sincronizar variantes, sincronizar imágenes.
 * 2. Después de la transacción exitosa: borrar imágenes huérfanas de Supabase Storage.
 */
export async function editarProducto(
  id: string,
  input: unknown,
): Promise<ResultadoEditarProducto> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = editarProductoFormSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Producto inválido:", parsed.error.flatten());
    return { ok: false, error: "Revisá los datos del producto." };
  }

  const { nombre, slug, lineaId, descripcion, dimensiones, garantia, activo, destacado, variantes } =
    parsed.data;

  try {
    // 1) Buscar variantes e imágenes actuales (para calcular diffs después)
    const actuales = await prisma.producto.findUnique({
      where: { id },
      select: {
        variantes: {
          select: {
            id: true,
            imagenes: { select: { id: true, url: true } },
          },
        },
      },
    });

    if (!actuales) {
      return { ok: false, error: "El producto no existe o fue eliminado." };
    }

    // URLs de imágenes actuales (para borrar huérfanas después)
    const urlsActuales = new Set(
      actuales.variantes.flatMap((v) => v.imagenes.map((img) => img.url)),
    );

    // IDs de variantes actuales y nuevas
    const idsVariantesActuales = new Set(
      actuales.variantes.map((v) => v.id),
    );
    const idsVariantesNuevas = new Set(
      variantes.filter((v) => v.id).map((v) => v.id!),
    );

    // Variantes a eliminar (existían pero ya no están en el form)
    const variantesAEliminar = [...idsVariantesActuales].filter(
      (vid) => !idsVariantesNuevas.has(vid),
    );

    // 2) Transacción: actualizar producto + sincronizar variantes + imágenes
    await prisma.$transaction(async (tx) => {
      // Actualizar datos del producto
      await tx.producto.update({
        where: { id },
        data: {
          nombre,
          slug,
          lineaId,
          descripcion,
          dimensiones,
          garantia,
          activo,
          destacado,
        },
      });

      // Eliminar variantes removidas (cascade elimina imágenes en BD)
      if (variantesAEliminar.length > 0) {
        await tx.variante.deleteMany({
          where: { id: { in: variantesAEliminar } },
        });
      }

      // Sincronizar cada variante del form
      for (const variante of variantes) {
        let varianteId: string;

        if (variante.id) {
          // Variante existente → actualizar
          await tx.variante.update({
            where: { id: variante.id },
            data: {
              color: variante.color,
              material: variante.material,
              sku: variante.sku,
              precio: variante.precio,
              precioTransferencia: variante.precioTransferencia ?? null,
              stock: variante.stock,
            },
          });
          varianteId = variante.id;
        } else {
          // Variante nueva → crear
          const nueva = await tx.variante.create({
            data: {
              productoId: id,
              color: variante.color,
              material: variante.material,
              sku: variante.sku,
              precio: variante.precio,
              precioTransferencia: variante.precioTransferencia ?? null,
              stock: variante.stock,
            },
          });
          varianteId = nueva.id;
        }

        // Sincronizar imágenes de esta variante
        const imagenesExistentes = await tx.imagen.findMany({
          where: { varianteId },
          select: { id: true, url: true },
        });

        const idsExistentes = new Set(imagenesExistentes.map((img) => img.id));
        const idsEnForm = new Set(
          variante.imagenes.filter((img) => img.id).map((img) => img.id!),
        );

        // Imágenes a eliminar (en BD pero ya no en el form)
        const imagenesAEliminar = [...idsExistentes].filter(
          (imgId) => !idsEnForm.has(imgId),
        );
        if (imagenesAEliminar.length > 0) {
          await tx.imagen.deleteMany({
            where: { id: { in: imagenesAEliminar } },
          });
        }

        // Crear imágenes nuevas (sin id)
        const imagenesNuevas = variante.imagenes.filter((img) => !img.id);
        if (imagenesNuevas.length > 0) {
          await tx.imagen.createMany({
            data: imagenesNuevas.map((img, index) => ({
              varianteId,
              url: img.url,
              alt: img.alt,
              orden: imagenesExistentes.length + index,
            })),
          });
        }

        // Actualizar orden de imágenes existentes que siguen en el form
        const imagenesMantenidas = variante.imagenes.filter(
          (img) => img.id && idsExistentes.has(img.id),
        );
        if (imagenesMantenidas.length > 0) {
          await Promise.all(
            imagenesMantenidas.map((img, index) =>
              tx.imagen.update({
                where: { id: img.id! },
                data: { orden: index },
              }),
            ),
          );
        }
      }
    });

    // 3) Después de la transacción exitosa: borrar imágenes huérfanas de Storage
    const urlsNuevas = new Set(
      variantes.flatMap((v) =>
        v.imagenes.map((img) => img.url).filter(Boolean),
      ),
    );
    const urlsABorrar = [...urlsActuales].filter((url) => !urlsNuevas.has(url));

    await Promise.allSettled(
      urlsABorrar.map((url) => borrarImagenSupabase(url)),
    );

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/editar/${id}`);
    return { ok: true };
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "El producto no existe o fue eliminado." };
    }
    console.error("Error al editar producto:", error);
    return { ok: false, error: "Ocurrió un error al guardar los cambios." };
  }
}

/**
 * Elimina un producto permanentemente.
 *
 * Flujo:
 * 1. Obtener URLs de imágenes de Storage.
 * 2. Eliminar el producto de la BD (cascade borra variantes e imágenes).
 * 3. Borrar imágenes de Supabase Storage.
 *
 * Si la BD falla, no se borran los archivos físicos.
 */
export async function eliminarProducto(
  id: string,
): Promise<ResultadoEliminarProducto> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  try {
    // 1) Recopilar URLs de imágenes antes de borrar
    const producto = await prisma.producto.findUnique({
      where: { id },
      select: {
        variantes: {
          select: {
            imagenes: { select: { url: true } },
          },
        },
      },
    });

    if (!producto) {
      return { ok: false, error: "El producto no existe o fue eliminado." };
    }

    const urls = producto.variantes.flatMap((v) =>
      v.imagenes.map((img) => img.url),
    );

    // 2) Eliminar de la BD (cascade)
    await prisma.producto.delete({ where: { id } });

    // 3) Borrar imágenes de Storage después del éxito en BD
    await Promise.allSettled(
      urls.map((url) => borrarImagenSupabase(url)),
    );

    revalidatePath("/admin/productos");
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "El producto no existe o fue eliminado." };
    }
    console.error("Error al eliminar producto:", error);
    return { ok: false, error: "Ocurrió un error al eliminar el producto." };
  }
}
