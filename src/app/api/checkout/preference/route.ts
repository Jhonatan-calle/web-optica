import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { Preference } from "mercadopago";

import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { MetodoPago, EstadoOrden } from "@/generated/prisma/enums";

const bodySchema = z.object({
  ordenId: z.string().min(1),
});

/** Resuelve la URL base del sitio para los `back_urls` de la preferencia. */
function getBaseUrl(req: NextRequest): string {
  const configurado = process.env.NEXT_PUBLIC_SITE_URL;
  if (configurado) return configurado.replace(/\/+$/, "");
  const origin = req.headers.get("origin");
  return origin ?? "http://localhost:3000";
}

/** Título legible del ítem para la pasarela (nombre + color). */
function titularItem(nombre: string, color?: string): string {
  const titulo = color ? `${nombre} - ${color}` : nombre;
  return titulo.slice(0, 120);
}

/**
 * Genera la preferencia de pago de Mercado Pago (Checkout Pro) para una orden.
 *
 * Los precios NO se confían en el cliente: se re-validan contra la base de
 * datos (la `Variante` ligada a cada `ItemOrden`). Si un ítem fue manipulado
 * o ya no existe, la preferencia se rechaza antes de llegar a la pasarela.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para generar el pago." },
        { status: 400 },
      );
    }

    let orden;
    try {
      orden = await prisma.orden.findUnique({
        where: { id: parsed.data.ordenId },
        include: {
          items: {
            include: { variante: true },
          },
        },
      });
    } catch (dbError) {
      console.error("Error al leer la orden para la preferencia:", dbError);
      return NextResponse.json(
        {
          ok: false,
          error:
            "No pudimos procesar tu solicitud, intentá de nuevo en unos minutos.",
        },
        { status: 500 },
      );
    }

    if (!orden) {
      return NextResponse.json(
        { ok: false, error: "La orden no existe." },
        { status: 404 },
      );
    }

    if (orden.metodoPago !== MetodoPago.MERCADO_PAGO) {
      return NextResponse.json(
        { ok: false, error: "Esta orden no es pagable online." },
        { status: 400 },
      );
    }

    if (orden.estado !== EstadoOrden.PENDIENTE) {
      return NextResponse.json(
        { ok: false, error: "Esta orden ya no está pendiente de pago." },
        { status: 400 },
      );
    }

    // Re-validación de precios contra la BD (anti-manipulación) y recálculo
    // del total esperado para comparar contra el total guardado de la orden.
    const items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }> = [];
    let subtotalRecalculado = 0;

    for (const item of orden.items) {
      const variante = item.variante;
      if (!variante) {
        return NextResponse.json(
          {
            ok: false,
            error: "Uno de los productos de tu pedido ya no está disponible.",
          },
          { status: 400 },
        );
      }

      const precioReal = Number(variante.precio);
      const precioOrden = Number(item.precioUnitario);
      if (Math.abs(precioReal - precioOrden) > 0.005) {
        console.warn(
          "Precio manipulado en la orden",
          orden.id,
          "variante",
          variante.id,
          "orden:",
          precioOrden,
          "bd:",
          precioReal,
        );
        return NextResponse.json(
          { ok: false, error: "Tu pedido no pudo ser procesado." },
          { status: 400 },
        );
      }

      subtotalRecalculado += precioReal * item.cantidad;
      items.push({
        id: variante.id,
        title: titularItem(item.nombreSnapshot, item.colorSnapshot ?? undefined),
        quantity: item.cantidad,
        unit_price: precioReal,
        currency_id: "ARS",
      });
    }

    const costoEnvio = Number(orden.costoEnvio ?? 0);
    if (costoEnvio > 0) {
      items.push({
        id: "envio",
        title: "Costo de envío",
        quantity: 1,
        unit_price: costoEnvio,
        currency_id: "ARS",
      });
    }

    const totalRecalculado = subtotalRecalculado + costoEnvio;
    if (Math.abs(totalRecalculado - Number(orden.total)) > 0.005) {
      return NextResponse.json(
        { ok: false, error: "El total de tu pedido no coincide." },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl(req);
    const urlOrden = `${baseUrl}/orden/${orden.id}`;

    const payerNombre = (orden.nombreContacto ?? "").trim();
    const [nombre, ...restoSplit] = payerNombre.split(" ");
    const apellido = restoSplit.join(" ");

    try {
      const cliente = new Preference(getMercadoPagoConfig());
      const respuesta = await cliente.create({
        body: {
          items,
          payer: {
            name: nombre || undefined,
            surname: apellido || undefined,
            email: orden.emailContacto,
            identification: orden.dniContacto
              ? { type: "DNI", number: orden.dniContacto }
              : undefined,
            phone: orden.telefonoContacto
              ? { area_code: undefined, number: orden.telefonoContacto }
              : undefined,
          },
          back_urls: {
            success: urlOrden,
            pending: urlOrden,
            failure: urlOrden,
          },
          auto_return: "approved",
          external_reference: orden.id,
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
          statement_descriptor: "LA OPTICA",
        },
      });

      if (!respuesta.init_point) {
        throw new Error("Mercado Pago no devolvió init_point");
      }

      return NextResponse.json({
        ok: true,
        initPoint: respuesta.init_point,
      });
    } catch (mpError) {
      console.error("Error al crear la preferencia de pago:", mpError);
      return NextResponse.json(
        {
          ok: false,
          error:
            "No pudimos generar el pago en este momento. Intentá de nuevo en unos minutos.",
        },
        { status: 502 },
      );
    }
  } catch (frameError) {
    console.error("Error inesperado en /api/checkout/preference:", frameError);
    return NextResponse.json(
      {
        ok: false,
        error: "No pudimos procesar tu solicitud, intentá de nuevo.",
      },
      { status: 500 },
    );
  }
}