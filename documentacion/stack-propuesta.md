# Propuesta de Stack (en revisión)

> Este documento es una propuesta preliminar. Puede cambiar tras discutirla con el equipo.

## Stack
- **Frontend:** Next.js (React) + TypeScript
- **Estilos:** Tailwind CSS + Shadcn UI
- **Estado:** Zustand (carrito) + TanStack Query (datos del servidor)
- **Backend:** Next.js Server Actions / API Routes
- **Base de datos:** Supabase (PostgreSQL) + Prisma ORM
- **Pagos:** MercadoPago (webhooks)
- **Auth:** NextAuth.js (roles CLIENT / ADMIN)
- **Deploy:** Vercel + dominio propio

## Por qué
- Un solo lenguaje (TypeScript) en todo el stack
- SEO y carga rápida del catálogo (SSG/ISR)
- PostgreSQL (Supabase) = consistencia ACID de stock y órdenes
- Carrito persistido en localStorage con Zustand
- Despliegue barato y simple en Vercel