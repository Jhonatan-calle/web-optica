# AGENTS.md

## Proyecto
E-commerce para **"La Óptica"** (venta hoy por Instagram `@_laoptica`): catálogo de lentes y accesorios, carrito, pagos, envíos y panel de administración.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Shadcn UI
- Zustand (carrito) + Server Components / Server Actions (datos de BD vía Prisma)
- Tablas admin (backoffice): `@tanstack/react-table@^8` (API v8: `useReactTable`/`ColumnDef`, el patrón estándar de Shadcn Data Table). ⚠️ **NO** usar `^9`: su API cambió (`useTable` + features, `createCoreRowModel`), incompatible con el patrón.
- Supabase (PostgreSQL) + Prisma 7 (adapter-pg, `prisma.config.ts`)
- Supabase Auth (roles CLIENT / ADMIN)
- MercadoPago (Checkout)
- Deploy: Vercel + dominio propio

## Documentación de referencia (fuente de verdad)
- `documentacion/srs-beta.md` — requisitos funcionales (RF), legales (RL), no funcionales (RNF) y roles.
- `documentacion/guiaEstetica.md` — guía de diseño UI/UX (paleta, tipografía, páginas, estados).
- `documentacion/workFlow.md` — road map de fases con checklists de implementación (detalle y estado de cada módulo).
- `documentacion/stack-propuesta.md` — propuesta histórica (⚠️ desactualizada: dice NextAuth.js y TanStack Query; lo vigente es este AGENTS → Supabase Auth + Server Actions).

## Assets
- Logo: `assets/logo/` (SVG + PNG). Acento de marca: teal `#00848C`.
- Variantes: `assets/logo/variantes/` (6 archivos).
- Favicons: `assets/logo/favicon.ico` + `icon-*.png`.

## Estructura
- `prisma/schema.prisma` — modelo de datos (enums, usuarios, catálogo, órdenes).
- `prisma.config.ts` — configuración de Prisma 7. Migraciones usan `DIRECT_URL` (conexión directa en Supabase); el runtime usa `DATABASE_URL` (pooled).
- `src/lib/prisma.ts` — instancia tipada de PrismaClient con adapter-pg.
- `src/generated/prisma/` — cliente Prisma generado. **Se versiona** (clonar funciona sin `prisma generate`); no se edita a mano.

## Estado de datos y reglas de negocio
- **Modelo de datos (fuente de verdad):** `prisma/schema.prisma`. Jerarquía del catálogo: `Tipo (1) → Linea (N) → Producto (N) → Variante (N) → Imagen (N)`, más tablas de órdenes y `Configuracion` (clave-valor, config global: cuotas y etiquetas de catálogo).
- **Etiquetas de las cards SE CALCULAN, no se guardan:** "10% OFF" desde `Variante.precio` vs `precioTransferencia`; "NUEVO" desde `Producto.createdAt` con umbral configurable `dias_producto_nuevo` (default 21 días) en la tabla `Configuracion`. Helpers en `src/lib/product-utils.ts` (`calcularCuotas`, `calcularBadge`): **no reimplementarlos**.
- **Envíos — decisión B5 resuelta:** las tarifas de envío se cotizan en tiempo real contra la **API de Shipnow** (agregador logístico; decisión B5). Cliente server-only `src/lib/shipnow.ts` (peso fijo 0.5 kg/ítem, dimensiones 20×15×5 cm, timeout 6 s, cache 5 min, modo `SHIPNOW_MOCK` para test sin credenciales, tarifa de contingencia `TARIFA_CONTINGENCIA` $7.500 si la API falla — el checkout nunca se bloquea). `src/lib/envio-utils.ts` fue eliminado.
- **Estado actual (resumen):** tienda pública, auth con roles, panel admin (productos/lineas/configuración/órdenes) y pagos Mercado Pago (preferencias, webhooks idempotentes, descuento de stock, email de confirmación) implementados. Envíos: cotización real contra la API de Shipnow (ver B5 arriba) y **despacho en scaffold** — el admin genera la etiqueta desde `/admin/ordenes/[id]` (`EtiquetaShipnowCard` + Server Action `generarEtiquetaOrden`, idempotente) y guarda `Orden.trackingNumber` + `Orden.etiquetaUrl` (migración `agregar-etiqueta-orden`): en modo `SHIPNOW_MOCK` tracking de ejemplo + etiqueta imprimible local (`/admin/shipnow/etiqueta/[ordenId]`); con API real se abre el PDF externo. **Pendiente:** el contrato real de la API de etiquetas/shipments (endpoint/parsers tentativos en `src/lib/shipnow.ts`, tarea de la compañera) y los datos reales del local (alias/CBU/titular en `src/lib/tienda-info.ts`, placeholders `EDITAR`).

## Convenciones
- Proyecto colaborativo (2 personas); `src/generated/` se versiona para que clonar funcionar sin `prisma generate`.
- NO hacer commits ni push automáticos; solo si lo pide explícitamente el usuario.
- Código y comentarios en español (según contexto), siguiendo el estilo del proyecto.
- **Canario de sesión:** al final de **toda respuesta**, incluí siempre el emoji **🐧**. (Se usa para verificar que el agente cargó correctamente las instrucciones de esta guía.)
- `util-remove/`, `.obsidian/`, `credenciales.txt` y `.env*` son locales/ignorados (no tocar).
- Estar atento a la documentación: proponer qué información nueva debería quedar en `documentacion/`, y advertir si el código deja desactualizado algún doc existente.
- **Cortesía ante errores (fail gracefully):** toda comunicación con la base de datos (Prisma) o con un servicio externo (Supabase, Mercado Pago, transportistas, etc.) que pueda fallar debe ir envuelta en manejo de errores (try/catch). Si ocurre un error no previsto, mostrar al usuario un mensaje amigable y genérico (ej. "No pudimos procesar tu solicitud, intentá de nuevo en unos minutos") — la UI debe "romperse de manera elegante" y nunca exponer excepciones crudas, stack traces ni detalles técnicos al cliente.
- **Flujo "plan → revisión → implementación":**
  1. **MODO PLANIFICACIÓN:** ante un nuevo requerimiento, SIEMPRE crear o actualizar `.opencode/plans/<feature>.md` (versionado). NO tocar código fuente (`.ts`/`.tsx`/`.prisma`). Estructura del plan: metadatos (versión + estado `Borrador`/`Revisión`/`Aprobado`), historial de revisiones al inicio, sección "Restricciones y Correcciones Previas (No repetir)", contexto/objetivo, cambios concretos (rutas exactas, firmas de funciones/actions, contratos de datos, render Server vs Client), criterios de aceptación y verificación.
  2. Al terminar el borrador, detenerse y pedir de forma explícita: *"Por favor somete este plan a revisión."*
  3. **ITERACIÓN DE FEEDBACK:** al recibir correcciones (ej. de Gemini), actualizar el plan: subir versión en el historial y registrar el error corregido en "Restricciones y Correcciones Previas". Útil también si cambia la sesión/contexto días después.
  4. **MODO IMPLEMENTACIÓN:** pasar a código SOLO cuando el usuario lo apruebe explícitamente. Seguir el plan secuencialmente y marcar cada tarea con `[x]`.
  5. **CIERRE:** al finalizar, mover el plan terminado a `documentacion/planes/<feature>-YYYYMMDD.md`, actualizar los `[x]` de `documentacion/workFlow.md`, y ejecutar `npx prisma format` y `npx prisma generate` si se modificó el schema.
- **Autorización explícita (Modo Plan Obligatorio):** NUNCA crear, borrar o modificar el código fuente de los archivos sin un mensaje explícito de permiso del usuario para proceder. Ya sea en casos simples o complejos, SIEMPRE se debe consultar o planificar antes de actuar sobre el código.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx prisma migrate dev` — aplicar migraciones a Supabase (tras editar el schema)
- `npx prisma generate` — regenerar el cliente (tras cambios de schema)
- `npx prisma validate` — validar el schema
