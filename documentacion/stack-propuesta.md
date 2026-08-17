# Propuesta de Stack (en revisión)

> Este documento es una propuesta preliminar. Puede cambiar tras discutirla con el equipo.

## Stack
- **Frontend:** Next.js (React) + TypeScript
  - *Para qué:* renderiza la tienda con carga rápida y buen SEO; TypeScript evita errores de tipos.
- **Estilos:** Tailwind CSS + Shadcn UI
  - *Para qué:* dar estilo a toda la interfaz y usar componentes accesibles listos (tablas, formularios del admin).
- **Estado:** Zustand (carrito) + TanStack Query (datos del servidor)
  - *Para qué:* Zustand guarda el carrito y lo persiste en el navegador; TanStack Query sincroniza datos con la base (stock, productos).
- **Backend:** Next.js Server Actions / API Routes
  - *Para qué:* lógica de negocio sin servidor aparte (crear órdenes, calcular totales, validar stock).
- **Base de datos:** Supabase (PostgreSQL) + Prisma ORM
  - *Para qué:* guarda productos, órdenes, usuarios y stock con consistencia ACID; Prisma simplifica las consultas tipadas.
- **Pagos:** MercadoPago (webhooks)
  - *Para qué:* cobra al cliente y confirma el pago al servidor para actualizar la orden.
- **Auth:** NextAuth.js (roles CLIENT / ADMIN)
  - *Para qué:* login seguro y control de acceso (solo ADMIN modifica productos/órdenes).
- **Deploy:** Vercel + dominio propio
  - *Para qué:* publicar el sitio en internet conectado al dominio de la óptica.

## Por qué
- Un solo lenguaje (TypeScript) en todo el stack
- SEO y carga rápida del catálogo (SSG/ISR)
- PostgreSQL (Supabase) = consistencia ACID de stock y órdenes
- Carrito persistido en localStorage con Zustand
- Despliegue barato y simple en Vercel