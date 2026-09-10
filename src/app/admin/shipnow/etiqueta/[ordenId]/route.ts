import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { MetodoEnvio } from "@/generated/prisma/enums";
import { calcularPesoKg } from "@/lib/shipnow";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { DIRECCION_LOCAL } from "@/lib/tienda-info";

/**
 * Etiqueta de despacho imprimible (Shipnow).
 *
 * Página standalone (no pasa por el layout del panel) con CSS de impresión.
 * Solo es válida para órdenes de envío (SHIPNOW) que ya tienen tracking:
 * si la API real devolvió una `etiquetaUrl` se usa esa URL externa; esta
 * vista local cubre el modo Shipnow Mock y las reimpresiones.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ordenId: string }> },
) {
  const { ordenId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  let orden;
  try {
    orden = await prisma.orden.findUnique({
      where: { id: ordenId },
      select: {
        id: true,
        numero: true,
        trackingNumber: true,
        nombreContacto: true,
        telefonoContacto: true,
        metodoEnvio: true,
        dirCalle: true,
        dirNumero: true,
        dirDepartamento: true,
        dirCiudad: true,
        dirProvincia: true,
        dirCodigoPostal: true,
        items: { select: { cantidad: true } },
      },
    });
  } catch (error) {
    console.error("No se pudo cargar la orden para la etiqueta:", error);
    return NextResponse.json(
      { error: "No pudimos generar la etiqueta." },
      { status: 500 },
    );
  }

  if (
    !orden ||
    orden.metodoEnvio === MetodoEnvio.RETIRO_LOCAL ||
    !orden.trackingNumber
  ) {
    redirect(`/admin/ordenes/${ordenId}`);
  }

  const cantidadItems = orden.items.reduce((acc, item) => acc + item.cantidad, 0);
  const pesoTotal = calcularPesoKg(cantidadItems);
  const local = escapeHtml(DIRECCION_LOCAL);
  const nombre = escapeHtml(orden.nombreContacto ?? "");
  const telefono = escapeHtml(orden.telefonoContacto ?? "");
  const calle = escapeHtml(
    `${orden.dirCalle} ${orden.dirNumero}${
      orden.dirDepartamento ? `, ${orden.dirDepartamento}` : ""
    }`,
  );
  const ciudad = escapeHtml(
    `${orden.dirCiudad}, ${orden.dirProvincia} · CP ${orden.dirCodigoPostal}`,
  );
  const tracking = escapeHtml(orden.trackingNumber);

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Etiqueta de despacho #${orden.numero} — La Óptica</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
        color: #1a1a1a;
        background: #f5f5f5;
        padding: 24px;
      }
      .etiqueta {
        max-width: 620px;
        margin: 0 auto;
        background: #fff;
        border: 1px dashed #999;
        border-radius: 8px;
        padding: 20px;
      }
      .encabezado {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-bottom: 2px solid #00848c;
        padding-bottom: 10px;
        margin-bottom: 14px;
      }
      .encabezado strong { color: #00848c; font-size: 18px; }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .bloque h2 {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
        margin-bottom: 4px;
      }
      .bloque p { font-size: 14px; line-height: 1.35; }
      .tracking {
        margin-top: 16px;
        border: 2px solid #00848c;
        border-radius: 8px;
        padding: 12px 16px;
        background: #f0fbfc;
      }
      .tracking .titulo {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #0e7490;
      }
      .tracking .codigo {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #0c4a6e;
      }
      .datos-extra {
        margin-top: 14px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        color: #374151;
      }
      .barcode {
        margin-top: 14px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        letter-spacing: 3px;
        font-size: 18px;
        color: #1a1a1a;
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
      }
      .acciones { text-align: center; margin-top: 18px; }
      .acciones button {
        background: #00848c;
        color: #fff;
        border: 0;
        border-radius: 6px;
        padding: 10px 22px;
        font-size: 14px;
        cursor: pointer;
      }
      .acciones .nota { margin-top: 8px; font-size: 12px; color: #6b7280; }
      @media print {
        body { background: #fff; padding: 0; }
        .etiqueta { max-width: none; margin: 0; border-style: solid; }
        .acciones { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="etiqueta">
      <div class="encabezado">
        <strong>La Óptica</strong>
        <span class="mono">Pedido #${orden.numero}</span>
      </div>

      <div class="grid">
        <div class="bloque">
          <h2>Remitente</h2>
          <p><strong>La Óptica</strong><br />${local}</p>
        </div>
        <div class="bloque">
          <h2>Destinatario</h2>
          <p>${nombre || "—"}<br />${calle}<br />${ciudad}<br />${telefono ? `Tel. ${telefono}` : ""}</p>
        </div>
      </div>

      <div class="tracking">
        <div class="titulo">Código de seguimiento · Shipnow — Envío Nacional</div>
        <div class="codigo mono">${tracking}</div>
      </div>

      <div class="datos-extra">
        <span>Ítems: ${cantidadItems}</span>
        <span>Peso estimado: ${pesoTotal.toLocaleString("es-AR")} kg</span>
        <span>Origen CP: 5800</span>
      </div>

      <div class="barcode">▌${tracking}▌</div>
    </div>

    <div class="acciones">
      <button onclick="window.print()">Imprimir etiqueta</button>
      <p class="nota">La etiqueta real la genera Shipnow cuando se validan las credenciales de producción.</p>
    </div>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}