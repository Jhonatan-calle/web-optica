# Plan: Gestión de stock en órdenes — descuento por aprobación manual y restauración al cancelar

## Metadatos

- **Versión:** 1.0
- **Estado:** Aprobado
- **Fecha:** 2026-09-10

## Historial de revisiones

| Versión | Cambio |
|---|---|
| 0.1 | Borrador inicial: flag `ItemOrden.stockDescontado` como fuente de verdad, helpers DRY en `src/lib/stock-utils.ts`, refactor webhook y `actualizarEstadoOrden`. |
| 1.0 | **Aprobado 100% por el usuario.** Implementado y verificado (prisma validate, tsc, lint, build de producción OK). Migración con backfill aplicada a Supabase. |

## Restricciones y Correcciones Previas (No repetir)

- No reimplementar helpers existentes (`calcularCuotas`, `calcularBadge`, lógica de envío, etc.).
- No modificar el contrato HTTP de Mercado Pago ni el de Shipnow; solo centralizar la lógica de stock.
- Fail gracefully: toda comunicación con BD envuelta en try/catch; mensajes amigables, nunca exponer excepciones.
- No tocar `.env*`, `util-remove/`, `.obsidian/`, `credenciales.txt`. Sin commits/push automáticos.
- `src/generated/` se versiona; regenerar con `npx prisma generate` tras cambios de schema.
- Tras tocar el schema: `npx prisma format` + migración + `migrate deploy` + `generate`.
- El `stockDescontado` es la **única fuente de verdad** de si un ítem fue descontado: todo descuento/restauración debe consultarlo o escribirlo (jamás inferir por el estado de la Orden).
- Canario de sesión 🐧 en toda respuesta.

## Contexto / Objetivo

Los flujos E2E del workflow exigen: **Flujo B** (cancelación restaura stock) y **Flujo C** (aprobación manual de transferencia descuenta stock). Dos bugs los rompían:

1. El stock **nunca se descontaba** en órdenes `TRANSFERENCIA`/`PAGO_EN_LOCAL` (el único path de descuento era el webhook de MP).
2. El stock **nunca se restauraba** al cancelar una orden.

Se resuelve con un flag **por ítem** (`ItemOrden.stockDescontado`) que hace idempotente el descuento en flujos asíncronos (webhooks) y manuales (admin), y permite restaurar con precisión (aun con `alertaStock`).

## Cambios concretos

### 1. Schema + migración
- `prisma/schema.prisma` → `model ItemOrden`: nuevo campo `stockDescontado Boolean @default(false)` con comentario.
- Migración `20260910151955_agregar_stock_descontado_item`:
  `ALTER TABLE "ItemOrden" ADD COLUMN "stockDescontado" BOOLEAN NOT NULL DEFAULT false;`
  + **backfill** histórica: `UPDATE "ItemOrden" io SET "stockDescontado" = true FROM "Orden" o WHERE io."ordenId" = o.id AND o."estado" IN ('PAGADO','EN_PREPARACION','DESPACHADO','LISTO_PARA_RETIRAR','ENTREGADO')` (los ítems de órdenes ya confirmadas arrancan con el flag en true).
- Aplicada con `npx prisma migrate deploy` + `npx prisma generate`.

### 2. `src/lib/stock-utils.ts` (helpers DRY, transaccionales)
- `descontarStock(tx, items): Promise<boolean>` — descuenta por ítem solo si alcanza (`updateMany` con `stock >= cantidad`, nunca deja stock negativo); marca `stockDescontado = true` en los `ItemOrden` efectivamente descontados; devuelve `true` si alguna variante faltó (alerta).
- `restaurarStock(tx, items): Promise<number>` — restaura solo los ítems con `stockDescontado = true` y vuelve el flag a `false`; devuelve cantidad restaurada (no sobre-restaura).
- Ambas reciben `Prisma.TransactionClient` (`@/generated/prisma/client`) y **deben** ejecutarse dentro de un `$transaction`.

### 3. Webhook MP `src/app/api/webhooks/mercadopago/route.ts`
- Reemplazado el loop inline de descuento por `descontarStock(tx, orden.items)` dentro del mismo `$transaction`.
- Se mantienen: verificación del pago contra la API de MP, monto, idempotencia (`updateMany` con `estado: PENDIENTE` → error controlado `orden_ya_procesada` con rollback), `alertaStock` y email fire-and-forget.

### 4. Server Action `src/app/admin/(panel)/ordenes/actions.ts` — `actualizarEstadoOrden`
- Select ampliado: `id`, `metodoEnvio` y `items: { id, varianteId, cantidad }`.
- Dentro de `prisma.$transaction`, según transición:
  - **`→ PAGADO`** (si la orden seguía `PENDIENTE`, sin importar `metodoPago`): `data.alertaStock = await descontarStock(tx, items)` → cubre transferencia, efectivo en local y webhooks MP que nunca llegaron.
  - **`→ CANCELADO`**: `await restaurarStock(tx, items)` y `data.alertaStock = false` (limpia la alerta residual de la orden).
  - Otro caso: solo `estado`/`trackingNumber` (sin tocar `alertaStock`).
- Se mantienen: validación de DESPACHADO + tracking (con `metodoEnvio` leído antes de la transacción), `revalidatePath` y mensajes de error amigables.

## Criterios de aceptación y verificación

1. **Flujo A (regresión):** webhook MP aprobado → `PAGADO`, stock descontado, ítems con `stockDescontado=true`. Webhook duplicado → no descuenta dos veces (idempotencia intacta).
2. **Flujo B:** orden `PAGADO` cancelada por admin → stock restaurado + `stockDescontado=false`. Cancelar una `PENDIENTE` → no toca stock.
3. **Flujo C:** orden `TRANSFERENCIA` → admin marca `PAGADO` → stock descontado + `alertaStock` correcto; ítem sin stock → `alertaStock=true` y ese ítem NO marca `stockDescontado`.
4. **Backfill:** órdenes existentes en `PAGADO+` → sus ítems arrancan `stockDescontado=true`.
5. Verificación: `prisma validate`, `npx tsc --noEmit`, `npm run lint` (0 errores) y `npm run build` (compila OK; el aviso de `/checkout` dinámico es preexistente).

## Documentación actualizada

- `documentacion/tareas-companera.md`: nota final corregida (antes decía "el stock NO se descuenta") y checkpoints de verificación de stock agregados a los casos 1/2/3/5.
- `documentacion/workFlow.md`: ítem completado "Gestión de stock al aprobar/cancelar órdenes" bajo el módulo de órdenes.