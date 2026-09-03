# AGENTS.md

## Proyecto
E-commerce para **"La Óptica"** (venta hoy por Instagram `@_laoptica`): catálogo de lentes y accesorios, carrito, pagos, envíos y panel de administración.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Shadcn UI
- Zustand (carrito) + TanStack Query (datos del servidor)
- Supabase (PostgreSQL) + Prisma 7 (adapter-pg, `prisma.config.ts`)
- NextAuth.js (roles CLIENT / ADMIN)
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

## Convenciones
- Proyecto colaborativo (2 personas); `src/generated/` se versiona para que clonar funcionar sin `prisma generate`.
- NO hacer commits ni push automáticos; solo si lo pide explícitamente el usuario.
- Código y comentarios en español (según contexto), siguiendo el estilo del proyecto.
- `util-remove/`, `.obsidian/` y `credenciales.txt` y `.env*` son locales/ignorados (no tocar).

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx prisma migrate dev` — aplicar migraciones a Supabase (tras editar el schema)
- `npx prisma generate` — regenerar el cliente (tras cambios de schema)
- `npx prisma validate` — validar el schema
