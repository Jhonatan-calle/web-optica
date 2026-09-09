# Plan: Sección 3 — Configuración del SDK y Entorno (Mercado Pago)

Checklist workFlow (primer ítem de Fase 3):
- [ ] Instalación de `mercadopago` (Node.js SDK) en el backend de Next.js.
- [ ] Configuración de variables de entorno privadas (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`).

Este paso es SOLO setup e inicialización. La generación de preferencias, el botón de pago y los webhooks son los ítems siguientes del workFlow.

## Contexto verificado
- Next.js 16 (Turbopack) + Node v24 → compatible con el SDK `mercadopago` v3.x (Node ≥ 18).
- El proyecto ya tiene `.env.example` versionado (con placeholders) y `.env`/`.env.local` ignorados — patrón establecido.
- `Orden.mpPaymentId` ya existe en el schema (sin `@unique` aún; eso es del ítem de webhooks).
- El cliente de Supabase usa el patrón "wrapper que inicializa leyendo env" (`src/lib/supabase/server.ts`) — espejar ese estilo.
- `server-only` NO está instalado aún.

## Cambios

### 1. Dependencia del SDK
- `npm install mercadopago` (instala v3.x del Node.js SDK oficial).
- `npm install server-only` (guardián mínimo, recomendado por Next: evita que el access token cruce al bundle del cliente).
  -> Alternativa sin dep extra: solo chequear el token en el wrapper; pero `server-only` es el estándar y barato.

### 2. `.env.example` (versionado, con placeholders)
Agregar al final:
```env
# --- Mercado Pago ---

# TOKEN de acceso (¡privado! nunca exponer). PRODUCCIÓN: APP_USR-...; DESARROLLO: TEST-APP_USR-...
MERCADOPAGO_ACCESS_TOKEN="APP_USR-<access-token>"

# Clave pública (identifica la aplicación). PRODUCCIÓN: APP_USR-...
MERCADOPAGO_PUBLIC_KEY="APP_USR-<public-key>"
```
Completar `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_PUBLIC_KEY` en `.env` local (NO se comitea). Usar **credenciales de prueba (TEST-...)** en desarrollo.

> Nota: `MERCADOPAGO_PUBLIC_KEY` es una clave pública. En este ítem queda como env privada (tal como pide el checklist). Si en un ítem futuro se usan Checkout Bricks en el frontend, se pasará a `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`.

### 3. Wrapper server-only `src/lib/mercadopago.ts` (nuevo)
Patrón estilo `src/lib/supabase/server.ts`.
```ts
import "server-only";
import { MercadoPagoConfig } from "mercadopago";

/** Cliente base de Mercado Pago (server-side). Lanza si falta el token. */
export function getMercadoPagoConfig(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return new MercadoPagoConfig({ accessToken });
}
```
- Los consumidores (`Preference`, `Payment`, webhooks) envuelven llamadas en try/catch con mensajes amigables (convención fail-gracefully).
- No se crean rutas ni se consume la API todavía: es el cimiento para los ítems siguientes.

## Archivos
- `package.json` / `package-lock.json` — deps nuevas.
- `.env.example` — sección Mercado Pago.
- `.env` / `.env.local` (local, ignorado) — credenciales reales (provee el usuario).
- `src/lib/mercadopago.ts` — wrapper nuevo.

## Reglas de negocio / seguridad
- El access token es información sensible: SOLO server-side (`server-only`), nunca en `.env.example` con valor real ni en el bundle del cliente.
- No confiar en valores del cliente: el precio de cada ítem se consultará en la BD al generar la preferencia (ítem siguiente).

## Verificación
- `npx tsc --noEmit` + `npm run lint` (+ build con dev server frenado).
- Smoke test del SDK en runtime: importar `MercadoPagoConfig` y construir el cliente con token de prueba (una verificación en un endpoint temporario o `node -e` si el módulo se puede cargar sin Next).
- Comprobar que `src/lib/mercadopago.ts` NO aparezca en el bundle del cliente (buscar "mercadopago" con `next build` / analyse).

## Docs
- `documentacion/workFlow.md`: marcar el ítem de Configuración del SDK y Entorno como `[x]` (los 2 sub-ítems).
- `AGENTS.md`: nota breve en "Estado actual" (Fase 3 iniciada: SDK de Mercado Pago instalado y env vars documentadas; pendiente preferencias/webhooks).