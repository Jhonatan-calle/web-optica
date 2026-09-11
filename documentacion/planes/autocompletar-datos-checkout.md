# Plan: Autocompletar datos de contacto en checkout para clientes registrados

## Metadatos
- **Versión:** 0.2
- **Estado:** Aprobado e implementado

## Historial de revisiones
- v0.1 (2026-09-09): borrador inicial.
- v0.2 (2026-09-09): aprobado 100% con ajustes arquitectónicos:
  1. Prefill desde el servidor (sin `useEffect` para evitar flicker):
     `obtenerDatosContactoUsuario()` se llama en la página Server y los datos se
     pasan como prop `datosUsuario` al componente cliente.
  2. `checkout-form.tsx` usa esa prop como `defaultValues` de react-hook-form
     (el HTML ya viaja precargado desde el servidor).
  3. `crearOrden` usa transacción atómica: `prisma.$transaction([orden.create, usuario.upsert])`.
- v0.3 (2026-09-09): UX "no volver a pedir el email" a clientes logueados.
  1. Se eliminó el guard `!perfil.nombre` en `obtenerDatosContactoUsuario`: un
     usuario sin compras previas (fila con nombre NULL) igual precarga su email.
  2. Con sesión, el campo email no se renderiza; se muestra un aviso
     `bg-muted p-3 rounded-md` ("Te enviaremos el detalle a <email>") y el email
     viaja en un `input type="hidden"` (mantiene intacta la validación de zod).

## Restricciones y Correcciones Previas (No repetir)
- No agregar estado de auth en cliente: la sesión se resuelve en el servidor.
- No crear store/Context de usuario; no tocar `src/lib/supabase/client.ts`.
- `src/generated/` se versiona: tras tocar el schema correr `prisma format` + `generate`.
- En español, fail-gracefully (nunca exponer errores crudos al cliente).

## Contexto / Objetivo
El formulario del checkout nacía vacío y solo persistía en localStorage
(anónimo). Para un usuario logueado, precargar su perfil (email, nombre,
teléfono, DNI) desde la BD sin flicker, vincular la orden a su cuenta
(`Orden.usuarioId`) y actualizar el perfil en cada compra.

## Cambios concretos

### 1. Schema + migración
- `prisma/schema.prisma` (`model Usuario`): `dni String?` (junto a `telefono`).
- Migración `agregar-dni-usuario` aplicada + `npx prisma generate`.

### 2. Server Action nueva — `src/app/(tienda)/checkout/actions.ts`
- `obtenerDatosContactoUsuario(): Promise<CheckoutDatos | null>`:
  `createClient()` + `auth.getUser()`; sin sesión o sin `nombre` → `null`;
  `prisma.usuario.findUnique` (email/nombre/telefono/dni); try/catch → `null`.

### 3. `crearOrden` — vincular cuenta + transacción atómica
- Resolver sesión con su propio try/catch (si falla → orden anónima, nunca bloquea).
- Con sesión: `prisma.$transaction([orden.create (con usuarioId), usuario.upsert (email/nombre/telefono/dni, sin tocar rol)])`.
- Sin sesión: `prisma.orden.create` igual al flujo previo.

### 4. Refactor page Server + prefill por prop (sin flicker)
- `src/app/(tienda)/checkout/page.tsx`: pasa a **Server Component** que llama a
  `obtenerDatosContactoUsuario()` y renderiza `<CheckoutCliente datosUsuario={datosUsuario} />`.
- `src/components/checkout/checkout-page.tsx` (nuevo): lógica cliente del
  antiguo `page.tsx` (stepper + `confirmarPedido`) movida tal cual, recibe
  `datosUsuario` y lo pasa a `<CheckoutForm>`.
- `src/components/checkout/checkout-form.tsx`: prop `datosUsuario` y
  `defaultValues: datosUsuario ?? { email, nombre, telefono, dni: "" }`.
  Sin `useEffect`, sin estados intermedios (el server renderiza ya precargado).

### 5. Documentación
- Este plan versionado → copiado a `documentacion/planes/` al cerrar.
- `documentacion/workFlow.md`: nuevo ítem `[x]` en Fase 2 §4.

## Criterios de aceptación
1. Logueado con perfil → paso 0 precargado (editable), sin parpadeo.
2. Logueado sin perfil → campos vacíos; la primera compra crea la fila con datos.
3. Cada compra vincula `Orden.usuarioId` y actualiza el perfil (atómico).
4. Anónimo → flujo previo idéntico.
5. Fallo de sesión/BD → checkout funciona, campos vacíos, sin errores crudos.

## Verificación
- `npx prisma validate` + `npx prisma generate` ✓
- `npx prisma migrate dev --name agregar-dni-usuario` ✓
- `npm run lint` ✓ (0 errores)
- `npm run build` ✓ (`/checkout` queda dinámico `ƒ` por uso de cookies)
- Manual: login → checkout precargado → crear orden → revisar `usuarioId` y DNI
  en `/admin/ordenes/[id]`.