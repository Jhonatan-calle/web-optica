# Plan: Auditoría UI/UX y Rendimiento (Flujo 1.2 del workflow)

## Metadatos

- **Versión:** 1.0
- **Estado:** Aprobado
- **Fecha de aprobación:** 2026-09-10
- **Ámbito:** Storefront público + panel admin + PWA mínima

## Historial de revisiones

| Versión | Fecha       | Cambios                                                                 |
| ------- | ----------- | ----------------------------------------------------------------------- |
| 0.1     | 2026-09-10  | Borrador inicial con D1/D2/D3 abiertos.                                 |
| 1.0     | 2026-09-10  | Aprobado: D1=Opción A, D2=Opción A, D3=Crear legales + corregir nav.    |

## Restricciones y Correcciones Previas (No repetir)

- **D1 – Imágenes (resuelto → Opción A):** `next/image` solo en los 8 componentes del storefront. El panel admin (`productos-columns`, `producto-form`, etc.) conserva `<img>`: sus URLs son externas/arbitrarias y el optimizer debe quedar libre para el catálogo. **No** agregar `remotePatterns` para hosts externos de admin.
- **D2 – Offline (resuelto → Opción A):** service worker **mínimo** en `public/sw.js` (sin Workbox, sin Build Manifest). Cache-first solo para estáticos inmutablemente versionados; network-first para el resto; fallback `{OFFLINE}`. El SW **no** debe interceptar peticiones cross-origin (Mercado Pago/Supabase/Shipnow).
- **D3 – Links muertos (resuelto → Crear legales + corregir nav):** NO crear rutas falsas (ej. `/catalogo/sol`); los filtros del header van a `/catalogo?tipo=…` matcheando el **nombre exacto** del `Tipo` (`linea.tipo.nombre`). Quitar `/carrito`, `/contacto` y `/mi-cuenta` de la navegación.
- **Errores y redirect en acciones:** `cerrarSesion()` lanza `redirect()`; en un try/catch hay que re-lanzar el error con `isRedirectError` de `next/dist/client/components/redirect-error` (si no, se traga el redirect y se muestra toast falso).
- **No tocar** `.env*`, `credenciales.txt`, `.obsidian`, `util-remove/`; `src/generated/` se versiona y no se edita a mano.
- **Canario de sesión:** emoji 🐧 obligatorio al final de toda respuesta (verificación de que el agente cargó AGENTS.md).

## Contexto / Objetivo

Flujo 1.2 del `workFlow.md`: asegurar calidad de UX y rendimiento previo al traspaso. Objetivos verificables: Lighthouse > 90 en Performance/SEO, carga responsiva en smartphones reales, feedback con toasts, skeletons al consultar la BD real y resiliencia offline (sin que la app "muera" sin conexión).

## Cambios concretos

### Fase A – Imágenes, metadata, SEO, nav y legales

- **Estructura:** `next.config.ts` con `images.remotePatterns` derivado de `NEXT_PUBLIC_SUPABASE_URL` (`pathname: /storage/v1/object/public/**`). Helper `src/components/ui/imagen-store.tsx` (`ImagenStore`): si `src` empieza con `/` o con el host de Supabase usa `next/image` (con `fill` si no hay width/height); si no, cae a `<img>` lazy (URLs externas).
- **Componentes migrados a `ImagenStore`:** `hero.tsx` (priority, box `relative hidden lg:flex`), `collections.tsx` (+fallback `/isologo.svg`), `catalog/product-card.tsx`, `product/product-gallery.tsx` (priority solo en la primera), `cart/cart-drawer.tsx`, `site-header.tsx`, `site-footer.tsx` (isologo con width/height 218×40 y clase `h-8/h-40 w-auto object-contain`).
- **SEO:** `layout.tsx` con `metadata` (default/template, description, `metadataBase` de `NEXT_PUBLIC_SITE_URL`, alternates, openGraph `es_AR`, twitter, robots, icons incl. apple) + `viewport` (`themeColor #00848C`). `generateMetadata` en `catalogo/page.tsx` (título por línea/tipo) y `producto/[slug]/page.tsx` (nombre + descripción + og:image).
- **Legales (RSC sin fetch):** `(tienda)/terminos-y-condiciones`, `(tienda)/politicas-de-privacidad`, `(tienda)/boton-de-arrepentimiento` (con aviso de revisión legal previa a publicación). Links en `site-footer.tsx` (columna Legales).
- **Nav corregida:** header `NAV_LINKS` → `/catalogo?tipo=Anteojo de Sol|Clip-on|Accesorios`; footer sin `/carrito` ni `/contacto`; `user-menu.tsx` sin `/mi-cuenta`.

### Fase B – Skeletons / Suspense

- Home `(tienda)/page.tsx`: `Collections` y `FeaturedProducts` en `<Suspense>` (skeletons `ColeccionesSkeleton` inline + `CatalogoGridSkeleton count={4}`).
- `producto/[slug]/page.tsx`: fetch movido a `ProductoDetalle` (con try/catch → mensaje amigable) envuelto en `<Suspense fallback={<ProductPageSkeleton />}>` (`components/product/product-skeleton.tsx`).
- `checkout/page.tsx`: `obtenerDatosContactoUsuario` movido a `DatosCheckout` dentro de `<Suspense fallback={<CheckoutSkeleton />}>`.
- `orden/[id]/page.tsx`: fetch de Prisma con try/catch dentro de `ContenidoOrden` + `<Suspense fallback={<OrdenPageSkeleton />}>`. (Se elimina `notFound` import incorrecto.)
- Admin: `lineas`, `configuracion`, `productos/nuevo`, `productos/editar/[id]` con `<Suspense>` + `AdminFormSkeleton`/`AdminTabsSkeleton` y try/catch con mensaje amigable (dashboard y productos ya los tenían).

### Fase C – Toasts y copy residual

- `productos-columns.tsx` `ToggleEstadoButton`: leer `ResultadoToggleEstado` y emitir `toast.success`/`toast.error` con `resultado.error`.
- `user-menu.tsx` y `admin-sidebar.tsx`: `cerrarSesion` envuelto en try/catch + `isRedirectError` (re-lanzar) + toast de error en falla.
- Copy sin referencias de fase: `entrega-form.tsx` (2 toasts), `pago-form.tsx` (3 toasts), `resumen-orden.tsx` detalle de pago online, comentario en `checkout/actions.ts`.

### Fase D – Resilience offline (PWA mínima)

- `public/sw.js`: cache `laoptica-v1`; install precachea `/` y `/offline`; `esEstatico` → cache-first (`_next/static`, `icon-*`, `favicon.ico`, `assets/`); navigations y el resto → network-first con fallback a `/offline`; solo peticiones del mismo origen; `skipWaiting` + `clients.claim()`; purge de caches viejas.
- `(tienda)/offline/page.tsx`: estado sin conexión con `metadata.robots.index=false`.
- `components/offline-register.tsx`: registra `/sw.js` solo en producción; montado en `layout.tsx`.

### Fase E – Verificación y docs

- `tsc --noEmit`, `npm run lint` (0 errores, warnings preexistentes de React Hook Form) y `npm run build` (warning preexistente de `/checkout` dinámico por cookies). Rutas legales y `/offline` compilan y se listan en el build.

## Criterios de aceptación

- [x] Build de producción exitoso con todas las rutas nuevas.
- [x] `tsc --noEmit` y lint sin errores.
- [x] Sin links 404 de navegación (`/catalogo/sol`, `/carrito`, `/contacto`, `/mi-cuenta`).
- [x] Storefront sin `<img>` sueltos fuera del helper `ImagenStore`.
- [ ] Verificación manual: Lighthouse > 90 Performance/SEO en desktop+mobile.
- [ ] Verificación manual: responsiva en smartphone real (iOS Safari / Android Chrome).
- [ ] Verificación manual: toasts, skeletons y `/offline` sin conexión.
- [ ] Legal review de las 3 páginas antes de publicar.

## Fuente de verdad

- `documentacion/workFlow.md` ítem "Auditoría de Experiencia de Usuario (UI/UX) y Rendimiento".
- `documentacion/guiaEstetica.md` (paleta `#00848C`, estados de carga).