# Plan: Despacho de envíos Shipnow — Generación de etiqueta (scaffold)

## Metadatos

- **Versión:** 0.2
- **Estado:** Aprobado
- **Fecha:** 2026-09-09

## Historial de revisiones

| Versión | Cambio |
|---|---|
| 0.1 | Borrador inicial (disparo D1 y schema D2 propuestos como opciones abiertas). |
| 0.2 | **Aprobado 100%.** Decisiones resueltas: D1-A (card propia + botón dedicado "Generar etiqueta", desacoplado del cambio de estado) y D2-B (`Orden.etiquetaUrl String?` con migración). Ajuste UI: enlace "Imprimir etiqueta" abre `etiquetaUrl` externa si existe, o la vista imprimible local si es `null` (modo Mock). |

## Restricciones y Correcciones Previas (No repetir)

- No reimplementar helpers existentes: `calcularPesoKg`/`cotizarShipnowServidor` viven en `src/lib/shipnow.ts`; **todo** contrato HTTP con la API real de Shipnow es tentativo hasta que la compañera valide la doc oficial (`https://shipnow.stoplight.io/docs/shipnow-api`) y queda centralizado en `src/lib/shipnow.ts`.
- Fail gracefully: cada llamada a BD (Prisma) y a Shipnow envuelta en try/catch → mensaje amigable; nunca exponer excepciones/stack traces al cliente.
- No tocar `.env*`, `util-remove/`, `.obsidian/`, `credenciales.txt`. Sin commits/push automáticos.
- `src/generated/` se versiona; regenerar con `npx prisma generate` tras cambios de schema.
- Tras tocar el schema: `npx prisma format` + migración nueva + `npx prisma migrate deploy` + `generate`.
- Rutas con paréntesis en `git add` van entre comillas.
- Canario de sesión 🐧 en toda respuesta.

## Contexto / Objetivo

Decisión B5 ya resuelta: Shipnow es el único integrador logístico. El flow actual crea la orden con `metodoEnvio = SHIPNOW` y `trackingNumber String?`. `DESPACHADO` exige tracking para envíos (validación cliente + servidor).

Objetivo: scaffold del despacho real — desde el detalle de la orden el admin genera la **etiqueta de despacho Shipnow** (código de seguimiento + etiqueta imprimible). En modo `SHIPNOW_MOCK` se genera un tracking de ejemplo y la etiqueta imprimible local; con API real se invoca el endpoint (contrato tentativo centralizado) y se persiste la URL del PDF para permitir reimpresiones.

## Cambios concretos

### 1. Schema (D2-B)
- `prisma/schema.prisma` → `model Orden`: agregar `etiquetaUrl String?` (comentado: URL del PDF/etiqueta devuelta por Shipnow; queda null en modo Mock).
- Migración nueva `agregar-etiqueta-orden` (`npx prisma migrate dev --create-only` preferido; si la shadow DB falla, migration.sql manual + `npx prisma migrate deploy`).
- `npx prisma format` + persistir migración + `npx prisma migrate deploy` + `npx prisma generate`.

### 2. `src/lib/shipnow.ts` — funciones de etiqueta
- `export interface DatosDespacho { numeroOrden: number; nombreDestinatario: string | null; telefono: string | null; dirCalle: string; dirNumero: string; dirDepartamento: string | null; dirCiudad: string; dirProvincia: string; dirCodigoPostal: string; cantidadItems: number; pesoKg: number; }`
- `export type ResultadoEtiqueta = { ok: true; origen: "mock" | "shipnow"; tracking: string; etiquetaUrl: string | null } | { ok: false; error: string }`
- `export async function generarEtiquetaShipnowServidor(datos: DatosDespacho): Promise<ResultadoEtiqueta>` — **nunca lanza**.
  - `SHIPNOW_MOCK=true`: `tracking = "SHIP-MOCK-<numeroOrden>-<4 alfanum>"`, `etiquetaUrl = null`.
  - Real (tentativo ⚠️): `const ENDPOINT_SHIPMENTS = "/v1/shipments"`; payload con `addressFrom { postalCode: "5800" }` (origen, ver `src/lib/tienda-info.ts`), `addressTo`, `packages[]` (reusa peso/dimensiones de las constantes); headers `Authorization: Bearer` + timeout 6 s; parse candidatos para `trackingNumber`/`tracking_code`/`shipment_*.tracking` y `labelUrl`/`label_url`/`pdfUrl`/`pdf_url`.
  - Ante fallo/timeout/sin credenciales → `{ ok: false, error: "No pudimos generar la etiqueta de envío. Intentá de nuevo en unos minutos." }` (NUNCA lanza).

### 3. `src/app/admin/(panel)/ordenes/actions.ts` — Server Action nueva
- `export interface ResultadoGenerarEtiqueta { ok: boolean; error?: string; aviso?: string; tracking?: string; }`
- `export async function generarEtiquetaOrden(ordenId: string): Promise<ResultadoGenerarEtiqueta>`
  1. `esAdmin` → redirect("/").
  2. `prisma.orden.findUnique` (select: `id, numero, trackingNumber, etiquetaUrl, metodoEnvio, dirCalle, dirNumero, dirDepartamento, dirCiudad, dirProvincia, dirCodigoPostal, nombreContacto, telefonoContacto, items: { select: { cantidad: true } }`) → try/catch.
  3. Validaciones: no existe → error; `METODO_ENVIO == RETIRO_LOCAL` → error "solo aplica a envíos a domicilio"; `!dirCalle || !dirNumero || !dirCiudad || !dirProvincia || !dirCodigoPostal` → error amigable; **ya tiene `trackingNumber` → `{ ok: true, aviso: "La orden ya tiene código de seguimiento" }`** (idempotente).
  4. `cantidadTotal = Σ items.cantidad`; `pesoKg = calcularPesoKg(cantidadTotal)`.
  5. `generarEtiquetaShipnowServidor({...})`.
  6. `!ok` → `{ ok: false, error }`.
  7. `prisma.orden.update({ trackingNumber: res.tracking, etiquetaUrl: res.etiquetaUrl })`.
  8. `revalidatePath("/admin/ordenes", "layout")` + revalidatePath(`/admin/ordenes/${ordenId}`, "layout")`.
  9. `{ ok: true, tracking: res.tracking }`.

(No se modifica `actualizarEstadoOrden`: el botón está desacoplado — D1-A.)

### 4. Ruta imprimible (nueva) `src/app/admin/shipnow/etiqueta/[ordenId]/route.ts`
- `GET`; `export const dynamic = "force-dynamic"`.
- `esAdmin` (redirect "/"); `findUnique` orden (select: `id, numero, trackingNumber, nombreContacto, telefonoContacto, dir*`) → try/catch.
- Si `RETIRO_LOCAL` o `!trackingNumber` → `redirect("/admin/ordenes/" + ordenId)`.
- Responde `text/html; charset=utf-8` con la etiqueta imprimible: remitente `DIRECCION_LOCAL` (Balcarce 776, Río Cuarto 5800), destinatario (nombre/telefono/calle/ciudad/CP), **tracking en grande**, proveedor "Shipnow — Envío Nacional", ítems + peso (`calcularPesoKg(Σ items.cantidad)` — traer items.cantidad), botón "Imprimir" (`window.print()`) + CSS `@media print` (ocultar botón, márgenes, tipografía monospace para códigos).
- No pasa por el layout del panel → salida limpia.

### 5. Componente (nuevo, cliente) `src/components/admin/etiqueta-shipnow-card.tsx`
- Props: `{ ordenId: string; numero: number; tracking: string | null; etiquetaUrl: string | null }`.
- Card "Etiqueta de despacho (Shipnow)".
  - Sin tracking: botón "Generar etiqueta" → `generarEtiquetaOrden(ordenId)` (pending con `Loader2` "Generando…"), éxito → `toast.success` + `router.refresh()`; fallo → `toast.error(resultado.error)`. Nota: "Etiqueta de prueba hasta validar la integración real de Shipnow."
  - Con tracking: muestra el código (monospace), Badge "Simulación" si `!etiquetaUrl`... si `etiquetaUrl === null` no sabemos si es mock o contingencia sino por origen; basta mostrar código + enlace "Imprimir etiqueta":
    - `etiquetaUrl` existe → `<a href={etiquetaUrl} target="_blank">` (PDF externo real).
    - `etiquetaUrl === null` → `<a href={/admin/shipnow/etiqueta/${ordenId}} target="_blank">` (vista imprimible local — modo Mock).
  - Botón de generar deshabilitado si ya hay tracking (idempotencia visual).

### 6. `src/app/admin/(panel)/ordenes/[id]/page.tsx`
- Renderizar `<EtiquetaShipnowCard ordenId={orden.id} numero={orden.numero} tracking={orden.trackingNumber} etiquetaUrl={orden.etiquetaUrl} />` **solo si `!esRetiro`**, entre `OrdenEstadoForm` y la grilla de cards.

### 7. Docs
- `documentacion/workFlow.md`: ítem "**Generación de Etiquetas y Despacho**" → `[x]` parcial (scaffold + modo Mock; contrato de la API real de etiquetas pendiente de validar en `src/lib/shipnow.ts`, tarea de la compañera).
- `documentacion/tareas-companera.md`: en la tabla de Shipnow sumar fila "Contrato de **etiquetas/shipments** validado (endpoint, cookie: tracking + URL PDF)".
- `AGENTS.md`: actualizar "Estado actual" (despacho: scaffold con mock implementado, `Orden.etiquetaUrl`, contrato real pendiente).

## Criterios de aceptación

1. Con orden de envío Shipnow con CP+dirección: el botón genera tracking mock, aparece en el form de estado, y "Imprimir etiqueta" (mock → local) abre la vista imprimible con datos correctos.
2. Retiro en local: no se muestra la card. Orden sin dirección completa: error amigable, sin crash.
3. Reintentar con tracking ya cargado: aviso idempotente; botón deshabilitado.
4. Flujo actual intacto: `DESPACHADO` sigue exigiendo tracking; `actualizarEstadoOrden` sin cambios.
5. `SHIPNOW_MOCK=false` sin key (o API caída): error amigable; server nunca lanza.
6. `npx tsc --noEmit`, `npm run lint` (0 errores), `npm run build` ✓.
7. Reiniciar `npm run dev` antes de probar (cliente Prisma regenerado).

## Verificación

- `npx prisma format`, migración aplicada (`SELECT * FROM "Orden"` con `etiquetaUrl` presente en Supabase), `npx prisma generate`.
- `npx tsc --noEmit` + `npm run lint` + `npm run build`.
- Prueba manual: orden de envío → `EN_PREPARACION` → Generar etiqueta (mock) → tracking visible → Imprimir etiqueta → `DESPACHADO` con tracking ya cargado. Retiro → sin card.