# La Óptica — Tienda en línea

E-commerce para **"La Óptica"** (venta actualmente por Instagram `@_laoptica`): catálogo de lentes y accesorios, carrito de compras, pagos, envíos y panel de administración.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **Shadcn UI**
- **Zustand** (carrito) + **TanStack Query** (datos del servidor)
- **Supabase** (PostgreSQL) + **Prisma 7** (adapter-pg, `prisma.config.ts`)
- **NextAuth.js** (roles `CLIENT` / `ADMIN`)
- **MercadoPago** (Checkout)
- Deploy: **Vercel** + dominio propio

## Requisitos previos

- **Node.js v24+** y **npm**
- Una base de datos **Supabase** (PostgreSQL) con las credenciales de conexión

## Puesta en marcha (clonado)

```bash
# 1) Clonar el repositorio
git clone https://github.com/Jhonatan-calle/web-optica.git
cd web-optica

# 2) Instalar dependencias
npm install

# 3) Configurar variables de entorno
cp .env.example .env.local
# → Editar `.env.local` y completar DATABASE_URL y DIRECT_URL con tus credenciales de Supabase
#   (ver sección Variables de entorno)

# 4) Aplicar las migraciones a la base de datos
npx prisma migrate dev

# 5) Levantar el servidor de desarrollo
npm run dev
# → Abrir http://localhost:3000
```

> **Nota:** el cliente de Prisma generado (`src/generated/prisma/`) se **versiona en el repo**, por lo que clonar funciona sin necesidad de correr `prisma generate`.

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

| Variable | Uso | Ejemplo |
|----------|-----|---------|
| `DATABASE_URL` | Conexión **pooled** (transaccional, puerto 6543). La usa la app en runtime. | `postgresql://user:pass@host.supabase.com:6543/postgres` |
| `DIRECT_URL` | Conexión **directa** (puerto 5432). La usan **solo las migraciones** de Prisma. | `postgresql://user:pass@host.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (auth/almacenamiento). Opcional por ahora. | `https://proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase. Opcional por ahora. | `eyJ...` |

> ⚠️ `.env.local` y `.env` están en `.gitignore`. **No los comitees.**

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (http://localhost:3000) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Prisma

```bash
npx prisma migrate dev   # aplicar migraciones a Supabase (tras editar prisma/schema.prisma)
npx prisma generate      # regenerar el cliente (tras cambios de schema)
npx prisma validate      # validar el schema
npx prisma migrate status # ver estado de las migraciones
```

- El **modelo de datos** está en `prisma/schema.prisma`.
- La **configuración** de Prisma 7 está en `prisma.config.ts` (las migraciones usan `DIRECT_URL`; el runtime usa `DATABASE_URL`).
- La **instancia** del cliente tipado está en `src/lib/prisma.ts`.

## Documentación

- `documentacion/srs-beta.md` — requisitos funcionales (RF), legales (RL), no funcionales (RNF) y roles.
- `documentacion/guiaEstetica.md` — guía de diseño UI/UX (paleta, tipografía, páginas, estados).
- `documentacion/workFlow.md` — road map de fases y checklist de Fase 1.
- `documentacion/stack-propuesta.md` — propuesta de stack y decisiones.
