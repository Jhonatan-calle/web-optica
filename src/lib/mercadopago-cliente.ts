export interface PreferenciaResultado {
  ok: boolean;
  initPoint?: string;
  error?: string;
}

/**
 * Pide al servidor la preferencia de pago de Mercado Pago para una orden y
 * devuelve el `init_point` de Checkout Pro. Vive solo del lado del cliente.
 */
export async function generarPreferenciaPago(
  ordenId: string,
): Promise<PreferenciaResultado> {
  try {
    const respuesta = await fetch("/api/checkout/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordenId }),
    });

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok || !datos?.ok) {
      return {
        ok: false,
        error: datos?.error ?? "Intentalo en unos minutos.",
      };
    }

    if (!datos.initPoint) {
      return {
        ok: false,
        error: "Mercado Pago no devolvió un link de pago.",
      };
    }

    return { ok: true, initPoint: datos.initPoint as string };
  } catch {
    return {
      ok: false,
      error: "Intentalo en unos minutos.",
    };
  }
}