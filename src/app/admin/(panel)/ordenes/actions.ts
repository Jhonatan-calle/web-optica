"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { EstadoOrden, MetodoEnvio } from "@/generated/prisma/enums";
import { estadoOrdenSchema } from "@/lib/orden-schema";
import {
  calcularPesoKg,
  generarEtiquetaShipnowServidor,
} from "@/lib/shipnow";
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

export interface ResultadoGenerarEtiqueta {
  ok: boolean;
  error?: string;
  aviso?: string;
  tracking?: string;
}

/**
 * Genera la etiqueta de despacho Shipnow para una orden de envío y guarda el
 * código de seguimiento (+ URL de la etiqueta si la API real la devuelve).
 *
 * Acción independiente del cambio de estado (desacoplada de
 * `actualizarEstadoOrden`): si Shipnow falla, el admin puede reintentar sin
 * bloquear el flujo del pedido.
 *
 * Idempotente: si la orden ya tiene tracking, devuelve `ok` con un aviso y NO
 * lo reemplaza.
 */
export async function generarEtiquetaOrden(
  ordenId: string,
): Promise<ResultadoGenerarEtiqueta> {
  if (!(await esUsuarioAdmin())) {
    redirect("/");
  }

  try {
    const orden = await prisma.orden.findUnique({
      where: { id: ordenId },
      select: {
        id: true,
        numero: true,
        trackingNumber: true,
        metodoEnvio: true,
        dirCalle: true,
        dirNumero: true,
        dirDepartamento: true,
        dirCiudad: true,
        dirProvincia: true,
        dirCodigoPostal: true,
        nombreContacto: true,
        telefonoContacto: true,
        items: { select: { cantidad: true } },
      },
    });

    if (!orden) {
      return { ok: false, error: "El pedido no existe o fue eliminado." };
    }

    if (orden.metodoEnvio === MetodoEnvio.RETIRO_LOCAL) {
      return { ok: false, error: "Los pedidos de retiro en local no se envían." };
    }

    if (
      !orden.dirCalle ||
      !orden.dirNumero ||
      !orden.dirCiudad ||
      !orden.dirProvincia ||
      !orden.dirCodigoPostal
    ) {
      return {
        ok: false,
        error: "La orden no tiene dirección de envío completa.",
      };
    }

    if (orden.trackingNumber) {
      return {
        ok: true,
        aviso: "La orden ya tiene código de seguimiento.",
        tracking: orden.trackingNumber,
      };
    }

    const cantidadItems = orden.items.reduce((acc, item) => acc + item.cantidad, 0);
    const resultado = await generarEtiquetaShipnowServidor({
      numeroOrden: orden.numero,
      nombreDestinatario: orden.nombreContacto,
      telefono: orden.telefonoContacto,
      dirCalle: orden.dirCalle,
      dirNumero: orden.dirNumero,
      dirDepartamento: orden.dirDepartamento,
      dirCiudad: orden.dirCiudad,
      dirProvincia: orden.dirProvincia,
      dirCodigoPostal: orden.dirCodigoPostal,
      cantidadItems,
      pesoKg: calcularPesoKg(cantidadItems),
    });

    if (!resultado.ok) {
      return { ok: false, error: resultado.error };
    }

    await prisma.orden.update({
      where: { id: ordenId },
      data: {
        trackingNumber: resultado.tracking,
        etiquetaUrl: resultado.etiquetaUrl,
      },
    });
  } catch (error) {
    console.error("Error al generar la etiqueta de la orden:", error);
    return {
      ok: false,
      error:
        "No pudimos generar la etiqueta de envío. Intentá de nuevo en unos minutos.",
    };
  }

  revalidatePath("/admin/ordenes", "layout");
  revalidatePath(`/admin/ordenes/${ordenId}`, "layout");

  return { ok: true };
}