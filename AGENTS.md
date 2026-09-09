# AGENTS.md

## Proyecto
E-commerce para **"La Óptica"** (venta hoy por Instagram `@_laoptica`): catálogo de lentes y accesorios, carrito, pagos, envíos y panel de administración.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Shadcn UI
- Zustand (carrito) + TanStack Query (datos del servidor)
- Tablas admin (backoffice): `@tanstack/react-table@^8` (API v8: `useReactTable`/`ColumnDef`, el patrón estándar de Shadcn Data Table). ⚠️ **NO** usar `^9`: su API cambió (`useTable` + features, `createCoreRowModel`), incompatible con el patrón.
- Supabase (PostgreSQL) + Prisma 7 (adapter-pg, `prisma.config.ts`)
- Supabase Auth (roles CLIENT / ADMIN)
- MercadoPago (Checkout)
- Deploy: Vercel + dominio propio

## Documentación de referencia (fuente de verdad)
- `documentacion/srs-beta.md` — requisitos funcionales (RF), legales (RL), no funcionales (RNF) y roles.
- `documentacion/guiaEstetica.md` — guía de diseño UI/UX (paleta, tipografía, páginas, estados).
- `documentacion/workFlow.md` — road map de fases y checklist de Fase 1.
- `documentacion/stack-propuesta.md` — propuesta de stack y decisiones.

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
- **Modelo de datos (fuente de verdad):** `prisma/schema.prisma`. Jerarquía del catálogo: `Tipo (1) → Linea (N) → Producto (N) → Variante (N) → Imagen (N)`, más tablas de órdenes y `Configuracion` (clave-valor, config global de cuotas).
- **Los mocks y la UI ya están reformateados a la forma del modelo** (chy: los datos de prueba imitan la jerarquía real). Helpers ya implementados en `src/lib/product-utils.ts`: `calcularCuotas`, `calcularBadge` y `MOCK_CONFIG`. **No reimplementarlos.**
- **Etiquetas de las cards SE CALCULAN, no se guardan:** "10% OFF" desde `Variante.precio` vs `precioTransferencia`; "NUEVO" desde `Producto.createdAt` (umbral de días *por definir*). No guardarlas como texto.
- **Pendiente — B5 (envío):** decidir si las tarifas de envío por CP salen de una tabla propia en BD o de una API de transportista (afecta en Fase 3; hoy hay tabla mock en `src/lib/envio-utils.ts`, usada por el PDP y el checkout).
- **Estado actual (Fase 2):** la tienda pública (home, catálogo, PDP) ya lee de la **base de datos** vía Prisma (Server Components + `searchParams` en el catálogo; `src/lib/catalog-utils.ts`). Los mocks fueron eliminados (`src/lib/mock-products.ts` no existe). La config de cuotas se lee de la tabla `Configuracion` (`src/lib/config-utils.ts`). **Pendientes:** envío real (decisión B5: tabla propia vs API; hoy `src/lib/envio-utils.ts` es mock) y datos del local (alias/CBU/titular en `src/lib/tienda-info.ts`, placeholders `EDITAR`).

## Convenciones
- Proyecto colaborativo (2 personas); `src/generated/` se versiona para que clonar funcionar sin `prisma generate`.
- NO hacer commits ni push automáticos; solo si lo pide explícitamente el usuario.
- Código y comentarios en español (según contexto), siguiendo el estilo del proyecto.
- **Canario de sesión:** al final de **toda respuesta**, incluí siempre el emoji **🐧**. (Se usa para verificar que el agente cargó correctamente las instrucciones de esta guía.)
- `util-remove/`, `.obsidian/` y `credenciales.txt` y `.env*` son locales/ignorados (no tocar).
- Estar atento a la documentación: proponer qué información nueva debería quedar en `documentacion/`, y advertir si el código deja desactualizado algún doc existente.
- **Cortesía ante errores (fail gracefully):** toda comunicación con la base de datos (Prisma) o con un servicio externo (Supabase, Mercado Pago, transportistas, etc.) que pueda fallar debe ir envuelta en manejo de errores (try/catch). Si ocurre un error no previsto, mostrar al usuario un mensaje amigable y genérico (ej. "No pudimos procesar tu solicitud, intentá de nuevo en unos minutos") — la UI debe "romperse de manera elegante" y nunca exponer excepciones crudas, stack traces ni detalles técnicos al cliente.


## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx prisma migrate dev` — aplicar migraciones a Supabase (tras editar el schema)
- `npx prisma generate` — regenerar el cliente (tras cambios de schema)
- `npx prisma validate` — validar el schema
