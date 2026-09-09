import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { Payment } from "mercadopago";

import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { enviarEmailConfirmacion } from "@/lib/email";
import { EstadoOrden, MetodoPago } from "@/generated/prisma/enums";

const webhookBodySchema = z.object({
  // Formato actual de las notificaciones: { type, data: { id } }
  type: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .optional(),
  // Formato clásico: { topic, id }
  topic: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

/**
 * Webhook de Mercado Pago (IPN).
 *
 * Mercado Pago avisa acá cuando un pago cambia de estado. La autenticidad NO se
 * puede confiar en el body (no hay firma): se verifica consultando el pago
 * contra la API de Mercado Pago y validando que su `external_reference`
 * apunte a una orden real con el monto exacto. Solo entonces se marca PAGADO.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Body inválido: responder 200 para no generar reintentos infinitos.
    return new NextResponse("ok", { status: 200 });
  }

  const parsed = webhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse("ok", { status: 200 });
  }

  const paymentId = parsed.data.data?.id ?? parsed.data.id;
  if (!paymentId) {
    return new NextResponse("ok", { status: 200 });
  }

  let payment;
  try {
    const clientePayment = new Payment(getMercadoPagoConfig());
    payment = await clientePayment.get({ id: paymentId });
  } catch (mpError) {
    console.error("Webhook: error al consultar el pago en Mercado Pago:", mpError);
    return NextResponse.json(
      { ok: false, error: "Error al consultar el pago" },
      { status: 502 },
    );
  }

  // Solo nos interesan los pagos aprobados.
  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true });
  }

  const externalReference = payment.external_reference;
  if (!externalReference) {
    return NextResponse.json({ ok: true });
  }

  let orden;
  try {
    orden = await prisma.orden.findUnique({
      where: { id: externalReference },
      include: { items: true },
    });
  } catch (dbError) {
    console.error("Webhook: error al buscar la orden:", dbError);
    return NextResponse.json(
      { ok: false, error: "Error al buscar la orden" },
      { status: 500 },
    );
  }

  if (!orden) {
    console.warn("Webhook: pago de orden inexistente", externalReference);
    return NextResponse.json({ ok: true });
  }

  if (
    orden.metodoPago !== MetodoPago.MERCADO_PAGO ||
    typeof payment.transaction_amount !== "number" ||
    Math.abs(Number(payment.transaction_amount) - Number(orden.total)) > 0.005
  ) {
    console.warn("Webhook: pago no coincide con la orden", externalReference);
    return NextResponse.json({ ok: true });
  }

  // Idempotente: si la orden ya está pagada con este mismo pago, no re-procesar.
  if (
    orden.estado === EstadoOrden.PAGADO &&
    orden.mpPaymentId === String(paymentId)
  ) {
    return NextResponse.json({ ok: true });
  }

  // Transacción atómica e idempotente:
  //  1) Descuenta stock por ítem solo si alcanza (updateMany condicional).
  //  2) Marca la orden PAGADO únicamente si seguía PENDIENTE; si ya estaba
  //     procesada, lanza el error controlado y hace ROLLBACK de los descuentos
  //     (el pago jamás se registra/descuenta dos veces).
  let stockFaltante = false;
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of orden.items) {
        if (!item.varianteId) continue;
        const resultado = await tx.variante.updateMany({
          where: {
            id: item.varianteId,
            stock: { gte: item.cantidad },
          },
          data: { stock: { decrement: item.cantidad } },
        });
        if (resultado.count === 0) {
          stockFaltante = true;
        }
      }

      const resultado = await tx.orden.updateMany({
        where: { id: orden.id, estado: EstadoOrden.PENDIENTE },
        data: {
          estado: EstadoOrden.PAGADO,
          mpPaymentId: String(paymentId),
          alertaStock: stockFaltante,
        },
      });
      if (resultado.count === 0) {
        throw new Error("orden_ya_procesada");
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "orden_ya_procesada") {
      // Notificación duplicada: la orden ya fue procesada, rollback hecho.
      return NextResponse.json({ ok: true });
    }
    console.error("Webhook: transacción de pago falló:", error);
    return NextResponse.json(
      { ok: false, error: "Error al procesar el pago" },
      { status: 500 },
    );
  }

  if (stockFaltante) {
    console.warn(
      "Webhook: stock insuficiente para completar el pedido",
      orden.id,
    );
  }

  // E-mail de confirmación (fire and forget): un fallo acá NO revierte el pago.
  enviarEmailConfirmacion({
    id: orden.id,
    numero: orden.numero,
    email: orden.emailContacto,
    total: Number(orden.total),
    items: orden.items.map((item) => ({
      nombre: item.nombreSnapshot,
      color: item.colorSnapshot ?? undefined,
      cantidad: item.cantidad,
      precio: Number(item.precioUnitario),
    })),
  }).catch((error) => {
    console.error("Webhook: error al enviar el email de confirmación:", error);
  });

  return NextResponse.json({ ok: true });
}

/** Mercado Pago puede mandar un GET de verificación al configurar el webhook. */
export async function GET() {
  return new NextResponse("ok", { status: 200 });
}