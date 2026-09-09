"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { EstadoOrden, MetodoEnvio } from "@/generated/prisma/enums";
import { estadoOrdenSchema } from "@/lib/orden-schema";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoActualizarOrden {
  ok: boolean;
  error?: string;
}

async function esUsuarioAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return esAdmin(user);
}

/**
 * Actualiza el estado de una orden y su número de seguimiento.
 *
 * La validación de negocio se hace en el servidor (nunca confiar solo en el
 * cliente):
 * - Si el estado pasa a DESPACHADO, la orden es de envío (no RETIRO_LOCAL) y
 *   el tracking está vacío/nulo, se rechaza la petición.
 */
export async function actualizarEstadoOrden(
  ordenId: string,
  input: unknown,
): Promise<ResultadoActualizarOrden> {
  if (!(await esUsuarioAdmin())) {
    redirect("/");
  }

  const parsed = estadoOrdenSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá el estado y el código de seguimiento.",
    };
  }

  const { estado, trackingNumber } = parsed.data;

  try {
    const orden = await prisma.orden.findUnique({
      where: { id: ordenId },
      select: { id: true, metodoEnvio: true },
    });

    if (!orden) {
      return { ok: false, error: "El pedido no existe o fue eliminado." };
    }

    const esDespachoPorCorreo =
      estado === EstadoOrden.DESPACHADO &&
      orden.metodoEnvio !== MetodoEnvio.RETIRO_LOCAL;

    if (esDespachoPorCorreo && !trackingNumber) {
      return {
        ok: false,
        error: "El código de seguimiento es obligatorio para envíos por correo.",
      };
    }

    await prisma.orden.update({
      where: { id: ordenId },
      data: { estado, trackingNumber },
    });
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    return {
      ok: false,
      error: "No pudimos actualizar el pedido. Intentá de nuevo en unos minutos.",
    };
  }

  revalidatePath("/admin/ordenes", "layout");
  revalidatePath(`/admin/ordenes/${ordenId}`, "layout");

  return { ok: true };
}