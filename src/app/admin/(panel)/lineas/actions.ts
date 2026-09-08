"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { lineaFormSchema, tipoFormSchema } from "@/lib/linea-schema";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoLinea {
  ok: boolean;
  lineaId?: string;
  error?: string;
}

export interface ResultadoTipo {
  ok: boolean;
  tipoId?: string;
  error?: string;
}

const RUTAS: readonly string[] = [
  "/admin/lineas",
  "/admin/productos/nuevo",
  "/catalogo",
];

function revalidar() {
  for (const ruta of RUTAS) {
    revalidatePath(ruta, "layout");
  }
}

/**
 * Crea una línea (colección). Guard de admin + validación zod + alta en BD.
 * El orden se asigna automáticamente: el último índice existente + 1.
 */
export async function crearLinea(input: unknown): Promise<ResultadoLinea> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = lineaFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los datos de la línea." };
  }

  try {
    const { _max } = await prisma.linea.aggregate({
      _max: { orden: true },
    });
    const proximoOrden = (_max.orden ?? -1) + 1;

    const linea = await prisma.linea.create({
      data: {
        tipoId: parsed.data.tipoId,
        nombre: parsed.data.nombre,
        descripcion: parsed.data.descripcion,
        imagenUrl: parsed.data.imagenUrl,
        orden: proximoOrden,
      },
      select: { id: true },
    });

    revalidar();
    return { ok: true, lineaId: linea.id };
  } catch (error) {
    console.error("Error al crear línea:", error);
    return { ok: false, error: "Ocurrió un error al crear la línea." };
  }
}

export async function actualizarLinea(
  id: string,
  input: unknown,
): Promise<ResultadoLinea> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = lineaFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los datos de la línea." };
  }

  try {
    const linea = await prisma.linea.update({
      where: { id },
      data: {
        tipoId: parsed.data.tipoId,
        nombre: parsed.data.nombre,
        descripcion: parsed.data.descripcion,
        imagenUrl: parsed.data.imagenUrl,
      },
      select: { id: true },
    });

    revalidar();
    return { ok: true, lineaId: linea.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "La línea no existe o fue eliminada." };
    }
    console.error("Error al actualizar línea:", error);
    return { ok: false, error: "Ocurrió un error al actualizar la línea." };
  }
}

/**
 * Elimina una línea. Si tiene productos, exige `moverA` (nueva línea) y mueve
 * los productos a esa línea en la misma transacción. Nunca borra con cascade.
 */
export async function eliminarLinea(
  id: string,
  moverA?: string,
): Promise<ResultadoLinea> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  try {
    const productos = await prisma.producto.findMany({
      where: { lineaId: id },
      select: { id: true },
    });

    if (productos.length > 0 && !moverA) {
      return {
        ok: false,
        error:
          "La línea tiene productos asignados. Elegí a qué línea moverlos antes de eliminar.",
      };
    }

    if (productos.length > 0 && moverA) {
      if (moverA === id) {
        return { ok: false, error: "Elegí una línea distinta para mover los productos." };
      }

      const destino = await prisma.linea.findUnique({
        where: { id: moverA },
        select: { id: true },
      });
      if (!destino) {
        return { ok: false, error: "La línea de destino no existe." };
      }

      await prisma.$transaction([
        prisma.producto.updateMany({
          where: { id: { in: productos.map((p) => p.id) } },
          data: { lineaId: moverA },
        }),
        prisma.linea.delete({ where: { id } }),
      ]);
    } else {
      await prisma.linea.delete({ where: { id } });
    }

    revalidar();
    revalidatePath("/admin/productos");
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "La línea no existe o fue eliminada." };
    }
    console.error("Error al eliminar línea:", error);
    return { ok: false, error: "Ocurrió un error al eliminar la línea." };
  }
}

/**
 * Reordena las líneas: asigna `orden = índice` (0..n-1) en una transacción,
 * según el orden recibido (ids = array reordenado por drag & drop).
 */
export async function reordenarLineas(ids: string[]): Promise<ResultadoLinea> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.some((id) => typeof id !== "string" || id === "")
  ) {
    return { ok: false, error: "El orden recibido es inválido." };
  }

  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: "Hay líneas duplicadas en el orden." };
  }

  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.linea.update({
          where: { id },
          data: { orden: index },
          select: { id: true },
        }),
      ),
    );

    revalidar();
    return { ok: true };
  } catch (error) {
    console.error("Error al reordenar líneas:", error);
    return { ok: false, error: "Ocurrió un error al reordenar las líneas." };
  }
}

export async function crearTipo(input: unknown): Promise<ResultadoTipo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = tipoFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá el nombre del tipo." };
  }

  try {
    const tipo = await prisma.tipo.create({
      data: { nombre: parsed.data.nombre },
      select: { id: true },
    });

    revalidar();
    return { ok: true, tipoId: tipo.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "Ya existe un tipo con ese nombre." };
    }
    console.error("Error al crear tipo:", error);
    return { ok: false, error: "Ocurrió un error al crear el tipo." };
  }
}

export async function renombrarTipo(
  id: string,
  input: unknown,
): Promise<ResultadoTipo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const parsed = tipoFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá el nombre del tipo." };
  }

  try {
    const tipo = await prisma.tipo.update({
      where: { id },
      data: { nombre: parsed.data.nombre },
      select: { id: true },
    });

    revalidar();
    return { ok: true, tipoId: tipo.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "Ya existe un tipo con ese nombre." };
    }
    console.error("Error al renombrar tipo:", error);
    return { ok: false, error: "Ocurrió un error al actualizar el tipo." };
  }
}

/**
 * Elimina un tipo. Bloqueado si tiene líneas asignadas (no se pierde data).
 */
export async function eliminarTipo(id: string): Promise<ResultadoTipo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  try {
    const tipo = await prisma.tipo.findUnique({
      where: { id },
      select: { _count: { select: { lineas: true } } },
    });

    if (!tipo) {
      return { ok: false, error: "El tipo no existe o fue eliminado." };
    }
    if (tipo._count.lineas > 0) {
      return {
        ok: false,
        error:
          "El tipo tiene líneas asignadas. Mové sus líneas a otro tipo antes de eliminarlo.",
      };
    }

    await prisma.tipo.delete({ where: { id } });

    revalidar();
    return { ok: true };
  } catch (error) {
    console.error("Error al eliminar tipo:", error);
    return { ok: false, error: "Ocurrió un error al eliminar el tipo." };
  }
}