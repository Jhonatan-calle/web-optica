import "server-only";

import { Resend } from "resend";

import { formatearPesos } from "@/lib/format-utils";

// ⚠️ Dominio a configurar/verificar en Resend (Fase 4, cuando se vincule el
// dominio de producción). Con `onboarding@resend.dev` funciona en pruebas.
const EMAIL_FROM = "La Óptica <no-reply@tudominio.com>";

export interface ItemEmailConfirmacion {
  nombre: string;
  color?: string;
  cantidad: number;
  precio: number;
}

export interface OrdenEmailConfirmacion {
  id: string;
  numero: number;
  email: string;
  total: number;
  items: ItemEmailConfirmacion[];
}

/**
 * Cliente de Resend (server-only). Lanza un error claro si falta la clave:
 * el caller debe envolver el envío en try/catch (convención fail-gracefully).
 */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está configurado");
  }
  return new Resend(apiKey);
}

/**
 * Envía el mail de confirmación de compra al cliente. NO debe bloquear el
 * flujo principal: en el webhook se dispara off de la respuesta (fire and
 * forget con .catch()).
 */
export async function enviarEmailConfirmacion(
  orden: OrdenEmailConfirmacion,
): Promise<void> {
  const resend = getResend();

  const filasHtml = orden.items
    .map((item) => {
      const titulo = item.color
        ? `${item.nombre} - ${item.color}`
        : item.nombre;
      const precio = formatearPesos(item.precio);
      const subtotal = formatearPesos(item.precio * item.cantidad);
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${titulo}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.cantidad} × ${precio}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${subtotal}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
      <h2 style="color:#00848C;margin-bottom:4px;">¡Gracias por tu compra!</h2>
      <p style="margin-top:0;color:#555;">Tu pedido <strong>#${orden.numero}</strong> fue confirmado y ya está en proceso.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;color:#777;font-weight:600;">Producto</th>
            <th style="text-align:center;color:#777;font-weight:600;">Cant.</th>
            <th style="text-align:right;color:#777;font-weight:600;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${filasHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:16px;margin-top:12px;">
        Total: <strong>${formatearPesos(orden.total)}</strong>
      </p>
      <p style="color:#888;font-size:12px;border-top:1px solid #dee2e6;padding-top:12px;">
        Ante cualquier consulta, respondé este correo o escribinos por Instagram <strong>@_laoptica</strong>.
      </p>
    </div>`;

  const resultado = await resend.emails.send({
    from: EMAIL_FROM,
    to: [orden.email],
    subject: `Pedido #${orden.numero} confirmado — La Óptica`,
    html,
  });

  if (resultado.error) {
    throw new Error(`Resend: ${resultado.error.message ?? "error al enviar"}`);
  }
}