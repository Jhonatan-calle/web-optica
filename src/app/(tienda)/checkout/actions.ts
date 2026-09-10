"use server";

import { crearOrdenSchema, mapMetodoEnvio, mapMetodoPago } from "@/lib/orden-utils";
import { calcularTotales } from "@/lib/pago-utils";
import { obtenerConfigCuotas } from "@/lib/config-utils";
import { prisma } from "@/lib/prisma";
import {
  calcularPesoKg,
  cotizarShipnowServidor,
  TARIFA_CONTINGENCIA,
} from "@/lib/shipnow";

export interface CrearOrdenResultado {
  ok: boolean;
  ordenId?: string;
  error?: string;
}

/**
 * Expone la configuración de cuotas (leída de la tabla `Configuracion`) para
 * que los componentes cliente del checkout puedan mostrar el texto de cuotas
 * real. Devuelve la config por defecto si no hay datos o hay un error.
 */
export async function obtenerConfigCuotasPublica() {
  return obtenerConfigCuotas();
}

export interface CotizarEnvioResultado {
  estado: "invalido" | "ok" | "contingencia";
  origen?: "shipnow" | "contingencia";
  precio?: number;
  dias?: number | null;
}

/**
 * Cotiza el envío contra Shipnow para un código postal y una cantidad de ítems
 * (peso estimado fijo de 0.5 kg por ítem). Usada por el checkout y el PDP.
 * Nunca expone errores crudos: si la API falla devuelve la tarifa de
 * contingencia para no bloquear la compra.
 */
export async function cotizarEnvioPublico(
  codigoPostal: string,
  cantidadTotal: number,
): Promise<CotizarEnvioResultado> {
  const cp = codigoPostal?.trim() ?? "";
  if (!/^\d{4}$/.test(cp)) {
    return { estado: "invalido" };
  }

  const cantidad = Math.min(Math.max(Math.round(cantidadTotal || 1), 1), 999);

  try {
    const cotizacion = await cotizarShipnowServidor({
      codigoPostal: cp,
      pesoKg: calcularPesoKg(cantidad),
      cantidadTotal: cantidad,
    });
    return {
      estado: cotizacion.origen === "shipnow" ? "ok" : "contingencia",
      origen: cotizacion.origen,
      precio: cotizacion.precio,
      dias: cotizacion.dias,
    };
  } catch (error) {
    console.error("Error al cotizar el envío:", error);
    return {
      estado: "contingencia",
      origen: "contingencia",
      precio: TARIFA_CONTINGENCIA,
      dias: null,
    };
  }
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

  try {
    // El costo de envío se RE-COTIZA en el servidor (anti-manipulación): no se
    // confía en el `costoEnvio` que mandó el cliente. Si Shipnow falla, se usa
    // la tarifa de contingencia y el checkout nunca se bloquea.
    let costoEnvio = 0;
    if (entrega.tipo === "envio") {
      const cantidadTotal = items.reduce(
        (acc, item) => acc + item.cantidad,
        0,
      );
      const cotizacion = await cotizarShipnowServidor({
        codigoPostal: entrega.codigoPostal,
        pesoKg: calcularPesoKg(cantidadTotal),
        cantidadTotal,
      });
      costoEnvio = cotizacion.precio;
    }
    const totales = calcularTotales(items, costoEnvio, pago.tipo);

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