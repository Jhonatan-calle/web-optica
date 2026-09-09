# Plan: Vista de Detalle de Orden `/admin/ordenes/[id]`

Checklist workFlow:
- [ ] Desglose de productos comprados (Snapshot de precio/variante).
- [ ] Datos de contacto, DNI de facturación y dirección de envío/retiro.
- [ ] Selector de estado + N° de Seguimiento/Tracking del correo.

## Decisiones del usuario
- Solo campo actual (sin historial/auditoría de estados).
- Reglas de validación del formulario de estado:
  1. **CANCELADO** → confirmación con `AlertDialog` al guardar.
  2. **DESPACHADO** con envío a domicilio → tracking **obligatorio** (bloquea guardado + error en UI).
  3. **RETIRO_LOCAL** → input de tracking `disabled="true"` (con hint). Flujo: EN_PREPARACION → LISTO_PARA_RETIRAR → ENTREGADO.
- Usar **Cards de Shadcn** para organizar cliente, logística, desglose de ítems y resumen financiero.

## 1. Schema (único cambio de BD)
`prisma/schema.prisma` — agregar en `model Orden` (junto a `mpPaymentId`):
```prisma
mpPaymentId String?
trackingNumber String?
```
Luego:
```
npx prisma migrate dev --name agregar_tracking_orden
npx prisma generate
```
`src/generated/prisma/` versionado entra al commit.

## 2. Servidor
### `src/lib/orden-schema.ts` (nuevo)
```ts
import { z } from "zod";
import { EstadoOrden } from "@/generated/prisma/enums";

export const estadoOrdenSchema = z.object({
  estado: z.nativeEnum(EstadoOrden),
  trackingNumber: z
    .string()
    .trim()
    .max(50, "El código de seguimiento es muy largo (máx 50 caracteres)")
    .transform((valor) => (valor === "" ? null : valor)),
});
export type EstadoOrdenInput = z.infer<typeof estadoOrdenSchema>;
```

### `src/app/admin/(panel)/ordenes/actions.ts` (nuevo)
Server action `actualizarEstadoOrden(ordenId, input)`:
- Guard `esAdmin` (redirect `/`).
- `estadoOrdenSchema.safeParse` → `{ ok:false, error }` si falla.
- try/catch `prisma.orden.update({ where:{ id }, data:{ estado, trackingNumber } })` → error amigable.
- `revalidatePath("/admin/ordenes", "layout")` + `revalidatePath(\`/admin/ordenes/${ordenId}\`, "layout")`.
- Devuelve `{ ok:boolean; error?:string }`.

## 3. Componente cliente `src/components/admin/orden-estado-form.tsx` (nuevo)
Props: `ordenId`, `numero`, `estadoActual`, `trackingActual`, `metodoEnvio`.

Estado local: `estado`, `tracking`, `errorTracking`, `dialogoCancelarAbierto`, `pendiente` (useTransition).

- `esRetiro = metodoEnvio === MetodoEnvio.RETIRO_LOCAL`
- `trackingRequerido = !esRetiro && estado === EstadoOrden.DESPACHADO`
- **Guardar:**
  - Si `trackingRequerido && tracking.trim() === ""` → `errorTracking = "El código de seguimiento es obligatorio al despachar por correo."` y NO llama a la action.
  - Si `estado === EstadoOrden.CANCELADO` → abre el AlertDialog de confirmación.
  - Si no → `guardar()` directo.
- **`guardar()`** con `startTransition(async () => ...)` llamando `actualizarEstadoOrden`, toast success/error, `router.refresh()`.
- **UI:**
  - `ui/select` controlado (`value`+`onValueChange`) con `SelectValueLabel` (opciones `ESTADOS_ORDEN` + `ETIQUETAS_ESTADO`), `w-full`.
  - `ui/input` de tracking: `disabled={esRetiro}`; bullet de ayuda según caso:
    - retiro: "Los pedidos de retiro en local no llevan código de seguimiento."
    - requerido (DESPACHADO): "Obligatorio al despachar por correo."
    - opcional: "Opcional: se completa al despachar por envío."
  - Error inline rojo (`aria-invalid` en input).
  - Button "Guardar cambios" con `Loader2`.
  - `AlertDialog` controlado (`open`/`onOpenChange`) si CANCELADO: título "¿Cancelar el pedido #N?", descripción "Esta acción marca el pedido como CANCELADO y no se puede deshacer.", `AlertDialogCancel` + `AlertDialogAction variant="destructive"` (patrón de `productos-columns.tsx`).

## 4. Página server `src/app/admin/(panel)/ordenes/[id]/page.tsx` (nuevo)
- `export const dynamic = "force-dynamic"`, metadata estática "Detalle de pedido | Panel La Óptica".
- Guard `esAdmin` (redirect `/`), `prisma.orden.findUnique({ where:{ id }, include:{ items:true } })`, `notFound()` si no existe.
- Layout (Cards Shadcn) con `<Button nativeButton={false} render={<Link href="/admin/ordenes" />}>` (ArrowLeft "Volver a órdenes"):
  1. **Cabecera:** "Pedido #N" + badges Estado/Pago/Envío (`ETIQUETAS_*` + `CLASES_COLOR_ESTADO`) + fecha (`formatearFecha(createdAt, "America/Argentina/Buenos_Aires")`).
  2. **Card "Estado y seguimiento"** → `<OrdenEstadoForm ... />` (cliente).
  3. **Grid `lg:grid-cols-2`:**
     - Card "Datos del cliente": nombre, email, teléfono, DNI.
     - Card "Logística": badge método envío; si `RETIRO_LOCAL` → `DIRECCION_LOCAL` (de `tienda-info`); si no → dirección armada de `dirCalle/numero/departamento/ciudad/provincia/codigoPostal`.
  4. **Card "Productos"** (full): lista de `items` con `nombreSnapshot`, `colorSnapshot`, `cantidad × precioUnitario` (precio snapshot) y `subtotal` (`formatearPesos`).
  5. **Card "Resumen"**: subtotal, descuento (si > 0), costo de envío, total (derivado igual que la pública `/orden/[id]`).
- try/catch en la query → mensaje amigable (patrón fail-gracefully de la lista).

## 5. Verificación
- `npx tsc --noEmit` + `npm run lint`.
- Build (avisar al usuario que frene el dev server) + prueba manual: crear orden real → cambiar estado, guardar tracking, validar bloqueos (CANCELADO confirma, DESPACHADO exige tracking, RETIRO_LOCAL deshabilitado).

## 6. Docs
- `documentacion/workFlow.md`: marcar los sub-ítems del detalle como `[x]`.
- `AGENTS.md`: nota breve del campo `trackingNumber`.