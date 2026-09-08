"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoToggleEstado {
  ok: boolean;
  activo: boolean;
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
