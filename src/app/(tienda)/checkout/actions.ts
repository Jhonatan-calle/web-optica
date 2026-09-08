"use server";

import { crearOrdenSchema, mapMetodoEnvio, mapMetodoPago } from "@/lib/orden-utils";
import { calcularTotales } from "@/lib/pago-utils";
import { prisma } from "@/lib/prisma";

export interface CrearOrdenResultado {
  ok: boolean;
  ordenId?: string;
  error?: string;
}

/**
 * Crea la orden (y sus ítems) en la base de datos a partir del checkout.
 *
 * Los totales se recalculan acá en el servidor con los snapshots del carrito
 * (no se confía en el total enviado por el cliente). La orden queda en estado
 * `PENDIENTE`; el pago real se conecta en la Fase 3.
 */
export async function crearOrden(input: unknown): Promise<CrearOrdenResultado> {
  const parsed = crearOrdenSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Algunos datos del pedido no son válidos. Revisá el checkout e intentá de nuevo.",
    };
  }

  const { datos, entrega, pago, items } = parsed.data;
  const costoEnvio = entrega.tipo === "envio" ? (entrega.costoEnvio ?? 0) : 0;
  const totales = calcularTotales(items, costoEnvio, pago.tipo);

  try {
    const orden = await prisma.orden.create({
      data: {
        emailContacto: datos.email,
        nombreContacto: datos.nombre,
        telefonoContacto: datos.telefono,
        dniContacto: datos.dni,
        metodoPago: mapMetodoPago(pago.tipo),
        metodoEnvio: mapMetodoEnvio(entrega.tipo),
        dirCalle: entrega.tipo === "envio" ? entrega.calle : null,
        dirNumero: entrega.tipo === "envio" ? entrega.numero : null,
        dirDepartamento:
          entrega.tipo === "envio" ? (entrega.departamento ?? null) : null,
        dirCiudad: entrega.tipo === "envio" ? entrega.ciudad : null,
        dirProvincia: entrega.tipo === "envio" ? entrega.provincia : null,
        dirCodigoPostal:
          entrega.tipo === "envio" ? entrega.codigoPostal : null,
        costoEnvio: totales.costoEnvio,
        subtotal: totales.subtotal,
        total: totales.total,
        items: {
          create: items.map((item) => ({
            varianteId: item.varianteId,
            nombreSnapshot: item.nombre,
            colorSnapshot: item.color,
            precioUnitario: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad,
          })),
        },
      },
    });

    return { ok: true, ordenId: orden.id };
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return {
      ok: false,
      error: "Ocurrió un error al generar tu pedido. Intentá de nuevo.",
    };
  }
}