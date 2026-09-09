import "server-only";

import { MercadoPagoConfig } from "mercadopago";

/**
 * Cliente base de Mercado Pago (server-side).
 *
 * `import "server-only"` garantiza que este módulo (y el access token) nunca
 * termine en el bundle del cliente. Los consumidores (Preference, Payment,
 * webhooks) deben envolver las llamadas en try/catch con mensajes amigables
 * (convención fail-gracefully del proyecto).
 */
export function getMercadoPagoConfig(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return new MercadoPagoConfig({ accessToken });
}

/** Clave pública de la aplicación (identifica la cuenta). */
export function getMercadoPagoPublicKey(): string | undefined {
  return process.env.MERCADOPAGO_PUBLIC_KEY || undefined;
}