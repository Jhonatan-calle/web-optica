### 🗺️ Estructura General del Proyecto (Roadmap de 4 Fases)

* **Fase 1: Descubrimiento & Configuración Base**
* **Fase 2: Desarrollo Core (Tienda Pública)** *(En la que estamos)*
* **Fase 3: Panel Administrativo & Integraciones (Pagos/Envíos)**
* **Fase 4: Pruebas, Despliegue & Entrega**

> ✅ **La tienda pública ya lee de la base de datos** (jerarquía `Tipo → Linea → Producto → Variante → Imagen`) vía `src/lib/catalog-utils.ts`; los mocks fueron eliminados (`src/lib/mock-products.ts` no existe). Helpers de cuotas/badges en `src/lib/product-utils.ts`: `calcularCuotas` (recibe la config real de cuotas de la tabla `Configuracion`) y `calcularBadge` (recibe el umbral de días "NUEVO", también de `Configuracion`). La lectura se hace con `obtenerConfigGlobal` (`src/lib/config-utils.ts`, defaults: 3 cuotas sin interés + 21 días) y se edita desde `/admin/configuracion`. *No hay que reimplementarlos.*
>
> ⚠️ **Única decisión de datos pendiente — B5 (envío):** decidir si las **tarifas de envío por código postal** salen de una **tabla propia en la base de datos** o de una **API de transportista externa**. Afecta solo cuando se integre el envío real (Fase 3); por ahora el estimado mock alcanza.

---

### 📍 Detalle de la FASE 1: Descubrimiento & Configuración Base

Esta fase sienta los cimientos del proyecto. No se escribe lógica compleja de negocio hasta tener esto resuelto.

#### **1. Relevamiento y Validación Comercial**

* [x] **Reunión con el cliente:** Resolver los 8 puntos `[PENDIENTE]` identificados en el SRS (recetados, variantes, empresa de correo, stock único, etc.).
* [x] **Obtención de activos de marca:** Logotipo en alta resolución, paleta de colores, tipografías e imágenes del catálogo/líneas para pruebas.
* [x] **Gestión de credenciales:** Accesos o creación de cuentas en Supabase y Vercel (para obtener claves de API / Testing).
* [ ] **Gestión de credenciales:** Accesos o creación de cuenta en Mercado Pago.

#### **2. Arquitectura de Base de Datos (Modelado ER)**

* [x] Diseñar el esquema de base de datos en `schema.prisma` definiendo las tablas principales:
  * `Usuario` (ID, email, rol, datos de contacto).
  * `Producto` y `Linea/Colección` (Nombre, precio, stock, imágenes).
  * `Orden` e `ItemOrden` (Relación entre cliente, productos comprados, estado del pago, datos de envío).

#### **3. Setup del Proyecto (Entorno de Desarrollo)**

* [x] Inicializar proyecto Next.js con TypeScript, Tailwind CSS y Shadcn UI.
* [x] Configurar Prisma ORM y conectar con la instancia de Supabase.
* [x] Configurar Zustand para la persistencia del carrito en `localStorage`.
* [x] Desplegar un "Hola Mundo" inicial en Vercel vinculado al repositorio (GitHub) para verificar el pipeline CI/CD desde el día uno.

---

¿Te parece bien la estructura propuesta para la **Fase 1** o te gustaría ajustar/agregar alguna actividad antes de pasar a detallar la **Fase 2 (Desarrollo de la Tienda)**?

¡Excelente avance! Completar el modelado del esquema en Prisma, el setup de Next.js, Zustand, Supabase y el pipeline de CI/CD en Vercel deja la base técnica lista para construir la interfaz y la lógica de usuario.

A continuación tienes el desglose detallado de la **Fase 2: Desarrollo Core (Tienda Pública)**, estructurado paso a paso para que puedas abordarlo de forma ordenada o ir ejecutándolo con tus herramientas de asistencia de código (Opencode/Cursor) guiándote con las reglas de estilo (`.opencode/rules.md`).

---

### 📍 Detalle de la FASE 2: Desarrollo Core (Tienda Pública)

El objetivo de esta fase es dejar la tienda pública 100% navegable, responsiva, funcional en cuanto a carrito/checkout e integrada con las normativas legales de Argentina.

#### **1. Sistema de Layout Base & Navegación (`app/layout.tsx`)**

* [x] **Announcement Bar (Top Bar):** Barra fija superior con fondo Teal (`#00848C`) destacando incentivos clave (ej. *"10% OFF vía Transferencia | Envío gratis a todo el país"*).
* [x] **Header / Navbar Responsiva:**
  * Logo de **La Óptica** con enlace a la Home.
  * Menú de navegación por categorías/líneas ("Líneas", "Anteojos de Sol", "Clip-ons", "Accesorios").
  * Buscador rápido (trigger) e ícono de carrito interactivo con badge contador de items en tiempo real.
  * Menú de cuenta de usuario (`UserMenu` en `src/components/user-menu.tsx`): si no hay sesión muestra el ícono que lleva a `/auth/login`; con sesión despliega un dropdown con "Mi cuenta", "Panel admin" (solo si el rol es `ADMIN`) y "Cerrar sesión". La sesión y el rol se resuelven en el Server Component del layout tienda (`src/app/(tienda)/layout.tsx` con `createClient` + `esAdmin`) y se pasan por props al header, evitando consultas en cliente (sin flicker ni mismatches de hidratación).
* [x] **Footer Completo (Requisitos Legales):**
  * [x] Columnas de navegación secundaria y redes sociales (`@_laoptica`).
  * [ ] Crear páginas legales con contenido: **Términos y Condiciones** (`/terminos-y-condiciones`) y **Políticas de Privacidad/Cambios** (`/politicas-de-privacidad`).
  * [ ] Crear página del **Botón de Arrepentimiento** (`/boton-de-arrepentimiento`) con formulario de solicitud de cancelación (plazo legal de 10 días corridos).
  * [ ] Completar **Data Fiscal (Formulario 960/D)**: obtener código/QR de la agencia de recaudación e insertarlo en el footer (por ahora hay placeholder).

#### **2. Páginas de la Tienda (UI/UX & Routing)**

* [x] **Home / Landing Page (`/`):**
  * [x] *Hero Section:* Banner principal con mensaje de marca ("Encontrá tu marco ideal") y CTA "Ver Catálogo".
  * [ ] Reemplazar el placeholder del hero (isologo sobre fondo `#F9FAFB`) por la **foto lifestyle real** con modelos de marca, en alta resolución. Por ahora el hero usa un placeholder visual a la espera del asset.
  * [x] *Carousel/Grid de Colecciones:* Acceso directo a las líneas destacadas (`obtenerColecciones`, Server Component).
  * [x] Conectar colecciones y productos destacados de la home a la base de datos: `src/components/home/collections.tsx` y `featured-products.tsx` son Server Components que consultan Prisma (`obtenerColecciones`/`obtenerDestacados` y config global de cuotas/etiquetas). Si falla la BD o no hay datos, la sección no se renderiza.
    * Las etiquetas de las cards se **calculan** (Opción A), NO se guardan como texto:
      * **"10% OFF" / descuento** = derivado de la diferencia entre `Variante.precio` y `Variante.precioTransferencia` (ej. `100 * (1 - precioTransferencia / precio)`).
      * **"NUEVO"** = derivado de la antigüedad del `Producto.createdAt`. Umbral configurable en la tabla `Configuracion` (clave `dias_producto_nuevo`, default 21 días), editable en `/admin/configuracion`. ✅ *Ya no es código fijo (dejó de estar "por definir").*
  * [ ] Reemplazar los placeholders de imagen (isologo sobre `#F9FAFB`) de las cards por las **imágenes reales de cada línea/colección**.
  * [x] *Grid de Productos Destacados:* Cards de productos más vendidos, con "Agregar al Carrito" (datos reales desde BD).
  * [x] *Banner de Valor:* Bloque con beneficios ("Envío Nacional", "3 Cuotas Sin Interés", "Retiro Gratis en Local").
* [ ] **Catálogo Completo / Colecciones (`/catalogo` o `/aros`):**
  * [x] Filtros horizontales por Línea/Colección, Material y Tipo de Producto (+ orden por precio). Datos reales desde BD; los filtros viven en la URL (`searchParams`) y se aplican en el servidor (`catalog-filters.tsx` navega con `router.replace`).
  * [x] Grid responsivo (2 columnas en Mobile, 3-4 en Desktop).
  * [x] Cards de Producto (componente `ProductCard` reutilizable) con contenedor `bg-[#F9FAFB]`, badges ("10% OFF", "NUEVO"), stack de precios (Lista vs. Transferencia) y desglose de cuotas.
  * [x] Conectar el catálogo a la base de datos: `src/app/(tienda)/catalogo/page.tsx` es Server Component que lee los `searchParams` (`q`, `linea`, `material`, `tipo`, `orden`), filtra/ordena en el servidor (`obtenerCatalogoPublico`) y renderiza el grid con `ProductCard`. Las etiquetas se **calculan** (Opción A) con `calcularBadge` desde `precio`/`precioTransferencia` y `createdAt` (umbral N leído de `Configuracion` via `obtenerConfigGlobal`, default 21 días, configurable en `/admin/configuracion`). Si la BD falla, muestra mensaje amigable.
* [ ] **Página de Detalle de Producto - PDP (`/producto/[slug]`):**
  * [x] Galería de fotos con imágenes en alta resolución (placeholders / isologo por ahora).
  * [x] Selector de variantes por color/material mediante *swatches* / pills de color (con variantes mock).
  * [x] Calculador interactivo de envíos por Código Postal (tabla de tarifas mock por rango de CP; pendiente API real/transportistas — ver B5).
  * [x] Acordeones colapsables (Shadcn Accordion) para dimensiones de los armazones, materiales y garantía. **Materiales** muestra los valores reales de las variantes del producto (lista de materiales únicos) con fallback amigable si no hay material cargado (fue texto hardcodeado; se eliminó por riesgo de crash con `material` vacío).
  * [x] Botón principal "Agregar al Carrito" (usa `useCartStore`; sin toast aún, queda para la fase de carrito).
  * [x] Conectar el PDP a la BD y mostrar las fotos reales: `src/app/(tienda)/producto/[slug]/page.tsx` es Server Component `force-dynamic` que busca con `obtenerProductoPublicoPorSlug` (devuelve `notFound()` si no existe/inactivo). `ProductGallery` ahora muestra **todas las imágenes** de la variante activa (thumbnails) y `ProductInfo` recibe la config real (cuotas + días "NUEVO").

#### **3. Carrito de Compras & Estado Global (Zustand)**

* [x] **Cart Drawer (Slide-over Sheet):**
  * Panel desplegable lateral al hacer clic en el ícono del carrito o agregar un producto.
  * Lógica de actualización de cantidad (`+` / `-`), eliminación de ítems y vaciado de carrito.
  * Almacenamiento tipo **Snapshot** (precio congelado, título, variante, imagen y cantidad) persistido en `localStorage` mediante Zustand (`useCartStore`).
* [ ] **Manejo de Feedbacks Visuales:**
  * [x] **Toasts de notificación (Sonner):** `<Toaster />` montado en `src/app/layout.tsx`; helper `showAddToCartToast` en `src/components/cart/add-to-cart-toast.tsx`. Se dispara al agregar desde `ProductCard` y `ProductInfo`.
  * [x] **Estados vacíos (*Empty States*):** carrito sin ítems (`cart-drawer.tsx`) y catálogo sin resultados de filtros/búsqueda (`catalogo/page.tsx`, distingue búsqueda vs. filtros).
  * [x] **Búsqueda en catálogo:** campo de búsqueda en `catalog-filters.tsx` filtrando por nombre en `catalogo/page.tsx`.
  * [x] **Skeletons de carga:** `ProductCardSkeleton` se usa en el catálogo a través de `CatalogoGridSkeleton`/`FiltrosSkeleton` (`src/components/catalog/catalogo-skeleton.tsx`), envueltos en `<Suspense>` con `key` por `searchParams`: al cambiar un filtro en la URL el usuario ve el esqueleto mientras el servidor obtiene los nuevos resultados. (El filtro activo atenúa los chips mientras navega).

#### **4. Flujo de Checkout sin Registro (Guest Checkout) (`/checkout`)**

* [x] **Formulario de Datos del Cliente:** Toma de datos obligatorios (Email, Nombre, Teléfono, DNI para facturación). Implementado en `src/components/checkout/checkout-form.tsx` + `src/app/checkout/page.tsx` con **react-hook-form + Zod** (`src/lib/checkout-schema.ts`). Los datos se persisten en un store Zustand (`src/lib/checkout-store.ts`, localStorage). Si el carrito está vacío, se bloquea el submit y se muestra `CheckoutVacio`. Al validar, guarda los datos y muestra toast "El siguiente paso (entrega y pago) llega pronto."
* [x] **Selección de Método de Entrega:**
  * Opción 1: Envío a Domicilio (solicita dirección completa y CP).
  * Opción 2: Retiro Gratis en el Local Físico de La Óptica.
  * Implementado en `src/components/checkout/entrega-form.tsx` + stepper en `src/app/checkout/page.tsx` (Paso 1 Datos → Paso 2 Entrega → Paso 3 Pago). Los datos se persisten en `src/lib/checkout-store.ts` (`entrega`, localStorage). El costo de envío se estima con el util compartido `src/lib/envio-utils.ts` (`calcularTarifaEnvio`, reutiliza la tabla mock de tarifas por CP; pendiente API real/transportistas — ver B5). La dirección y horario del local para retiro viven en `src/lib/tienda-info.ts`.
* [x] **Selección de Método de Pago:**
  * Opción 1: Pago Online (preparado para conectar el SDK de Mercado Pago en la Fase 3).
  * Opción 2: Transferencia Bancaria (muestra datos CBU/Alias y aplica descuento automático).
  * Opción 3: Pago en Efectivo al Retirar en el Local.
  * Implementado en `src/components/checkout/pago-form.tsx` + paso 3 del stepper en `src/app/checkout/page.tsx`. Los datos se persisten en `src/lib/checkout-store.ts` (`pago`, localStorage). Los totales (subtotal/descuento por transferencia/envío/total) se calculan con `src/lib/pago-utils.ts` (`calcularTotales`); el descuento por transferencia usa el snapshot `precioTransferencia` del carrito (`src/lib/cart-store.ts`), las cuotas se leen de la tabla `Configuracion` vía la server action `obtenerConfigCuotasPublica` (`checkout/actions.ts`, default 3 sin interés) y solo aplican a Pago Online (`calcularCuotas`, `pago-form.tsx`). El CBU/Alias/titular viven (placeholder `EDITAR`) en `src/lib/tienda-info.ts`. Efectivo en local solo disponible si la entrega es retiro (RF-11). Enum `MetodoPago` extendido con `TRANSFERENCIA` en `prisma/schema.prisma` (migración `agregar-transferencia-metodo-pago`), listo para mapear la orden.
* [ ] ⚠️ **Pendiente (dato real):** completar `ALIAS_LA_OPTICA`, `CBU_LA_OPTICA` y `TITULAR_CUENTA` en `src/lib/tienda-info.ts` — hoy son placeholders `EDITAR` y son necesarios para que la opción "Transferencia Bancaria" funcione de verdad. **Checkbox futuro ➕:** evaluar migrar estos datos (y el announcement "10% OFF") a la tabla `Configuracion` para editarlos sin tocar código.
* [x] **Página de Confirmación de Pedido (`/orden/[id]`):**
  * Resumen del pedido generado en la base de datos (PostgreSQL/Prisma) con estado "Pendiente de Pago".
  * Implementado con la Server Action `crearOrden` en `src/app/checkout/actions.ts` (valida el payload con zod, recalcula totales con `calcularTotales` en el servidor y crea `Orden` + `ItemOrden` con estado `PENDIENTE`). El mapping de métodos vive en `src/lib/orden-utils.ts` (`METODO_PAGO`/`METODO_ENVIO`: envío a domicilio → `ENVIO_PROPIO` por decisión de logística local, B5; retiro → `RETIRO_LOCAL`). La página `src/app/orden/[id]/page.tsx` muestra número, datos de contacto y totales vía el componente compartido `src/components/checkout/resumen-orden.tsx`, más instrucciones por método (transferencia: CBU/Alias/titular; retiro: dirección y horario; online: aviso de Fase 3). El botón "Confirmar pedido" del paso 4 crea la orden, limpia carrito y checkout y redirige. El modelo `Orden` se extendió con `nombreContacto`/`telefonoContacto`/`dniContacto` (migración `agregar-contacto-orden`).

---

### 📍 Detalle de la FASE 3: Panel Administrativo & Integraciones (Pagos/Envíos)

El objetivo de esta fase es dotar al cliente de **La Óptica** de las herramientas de gestión interna (Backoffice), conectar la pasarela de pagos real (**Mercado Pago**) y resolver la logística de envíos para procesar transacciones completas de principio a fin.

#### **1. Autenticación y Control de Acceso por Roles (`NextAuth.js` / Supabase Auth)**

* [ ] **Configuración de Supabase Auth (Providers & Middleware):**
  * [x] Base SSR instalada con `@supabase/ssr`: clientes browser (`src/lib/supabase/client.ts`) y server (`src/lib/supabase/server.ts`, Server Components/Actions), refresco de sesión en `src/middleware.ts` (`updateSession` con `supabase.auth.getUser()`). Env: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  * [x] Implementar autenticación (**email + contraseña**) con alta de usuarios y rol (`CLIENT` / `ADMIN`, guardado en `app_metadata` de Supabase Auth):
    * Páginas públicas en `src/app/auth/`: `/auth/login` y `/auth/registro` (SSR, `max-w-md`, branding) con forms en `src/components/auth/` (`login-form.tsx` / `register-form.tsx`, react-hook-form + zod vía `src/lib/auth-schema.ts` + `useActionState`-style con estados de error/spinner). Server Actions en `src/app/auth/actions.ts` (`ingresar` con `signInWithPassword`, `registrarse` con `signUp` + `emailRedirectTo`; usan el cliente server `src/lib/supabase/server.ts`). Al estar logueado, `/auth/*` redirige a `/`.
    * **Confirmación de email:** soporta ambas configuraciones. Con confirmación activa (default en proyectos hosted) muestra "revisá tu email" tras el registro; el link se intercambia en `src/app/auth/confirm/route.ts` (`verifyOtp` para `token_hash`+`type`, y `exchangeCodeForSession` como respaldo PKCE). Con confirmación desactivada (local/dev) redirige directo al inicio.
    * **Rol en `app_metadata` (server-side, nunca desde el cliente):** trigger SQL `supabase/rol_app_metadata.sql` (ejecutar 1 vez en el SQL Editor de Supabase). `BEFORE INSERT ON auth.users` setea `app_metadata.rol` (whitelist de emails admin → `ADMIN`, resto → `CLIENT`) y `AFTER INSERT` **crea la fila en `public."Usuario"` (Prisma)** mapeando `id` de auth → id, email y rol (con backfill para usuarios preexistentes). La whitelist de emails admin está unificada a `jhonatancallegaleano@gmail.com` en los tres bloques (app_metadata, tabla `Usuario` y backfill).
  * [x] Crear la protección de rutas privadas `/admin/*` en el middleware (redirigir a `/admin/login` si no hay sesión/rol válido):
    * Guard en `src/lib/supabase/middleware.ts` dentro de `updateSession` (reusa el `getUser()` que ya se llamaba): para rutas `/admin/*` (excepto `/admin/login`, que se excluye para no hacer bucle) sin sesión → redirect a `/admin/login?next=<ruta>`; con sesión pero rol distinto de `ADMIN` (`getRol()` sobre `app_metadata.rol`) → redirect a `/`. El matcher de `src/middleware.ts` ya cubría `/admin/*`.
    * **`/admin/login` funcional** (`src/app/admin/login/page.tsx`): reutiliza `LoginForm` (ahora acepta prop `next`, hidden input) y la Server Action `ingresar` redirige a ese `next` (validado: ruta interna, default `/`; en el panel default `/admin`). Si ya está logueado: ADMIN → `/admin`, CLIENT → `/`.
    * Placeholder mínimo `src/app/admin/page.tsx` ("Panel en construcción") hasta armar el Dashboard en la siguiente sección.
    * ⚠️ El rol viene de `app_metadata.rol` (trigger `supabase/rol_app_metadata.sql`). Si el SQL no corrió, todos cuentan como CLIENT y el ADMIN no pasa el guard.

* [x] **Rutas y Control de Permisos:**
  * [x] Login administrativo en `/admin/login` (reutiliza `LoginForm` + `ingresar` con `next=/admin`; reemplaza a `/auth/login` para el backoffice).
  * [x] Verificación del rol de usuario (`ADMIN` vs `CLIENT`) en el middleware: un usuario sin rol `ADMIN` que intenta acceder a `/admin` es redirigido a la tienda pública `/`.
  * [x] Persistencia de sesión mediante JWT/Session Tokens (refresco y mantenimiento del token en `src/middleware.ts` → `updateSession` con `supabase.auth.getUser()`).

#### **2. Panel Administrativo / Backoffice (`/admin`)**

* [x] **Dashboard General (`/admin`):**
  * [x] Vista de métricas clave: Ventas totales del mes, pedidos pendientes de despacho, stock crítico/bajo y total de órdenes del día.

* [x] **Módulo de Gestión de Catálogo - CRUD (`/admin/productos` y `/admin/lineas`):**
  * [x] **Lista de Productos (Data Table con Shadcn):** Tabla con buscador, filtros por línea, estado (`Activo`/`Pausado`) y acciones rápidas. Implementada con **TanStack Table v8** (`@tanstack/react-table@^8`) + componentes Shadcn `table`/`select` (patrón base-nova con `@base-ui/react`). **Filtrado híbrido:** el Server Component (`src/app/admin/(panel)/productos/page.tsx`) lee los `searchParams` de la URL y ejecuta las queries de Prisma (buscador `q` con contains/insensitive sobre nombre y slug, filtro por `lineaId` y por `activo`); la tabla cliente (`src/components/admin/productos-table.tsx`) renderiza con TanStack y sincroniza los filtros con la URL vía `router.push` (debounce 300ms en el buscador). Toggle Activo/Pausado como Server Action `toggleEstadoProducto` (`src/app/admin/(panel)/productos/actions.ts`) con guard `esAdmin` + `revalidatePath("/admin/productos")`. Nota: la página vive en `(panel)/productos` para heredar el layout (sidebar). El sidebar ahora marca el item activo por ruta (`usePathname`, `src/components/admin/admin-sidebar.tsx`). ⚠️ Validación con datos reales: pendiente hasta que exista el catálogo en BD (hoy la tienda usa mocks); la tabla ya consulta Prisma directo.
  * [x] **Formulario de Creación/Edición de Producto (`/admin/productos/nuevo`):**
    * [x] Campos base: Nombre, Slug automático (con override manual), Descripción, Línea asignada, Dimensiones y Garantía (B3).
    * [x] Gestión de Variantes: Alta dinámica de variantes por Color/Material, Precio de Lista, Precio por Transferencia y Stock disponible.
    * [x] Carga de Imágenes: Integración con Supabase Storage para subir fotografías por variante y obtener URLs públicas.
    * [ ] **Edición de Producto (`/admin/productos/[id]`):** reutilizar `producto-form.tsx` precargado con los datos del producto (variantes e imágenes incluidas) y Server Action `actualizarProducto` (mismo esquema zod + guard `esAdmin`).
    * Nota: **implementada la ALTA** (`/admin/productos/nuevo` con `src/components/admin/producto-form.tsx`). La EDICIÓN queda pendiente (reusaría el mismo form precargado). Form en 3 tabs con `Tabs`/`Switch` (base-nova): Datos básicos, Variantes (`useFieldArray` de react-hook-form) e Imágenes (preview + subida). Server Action `crearProducto` (`actions.ts`) con zod safeParse, guard `esAdmin` y alta anidada Prisma (producto → variantes → imágenes con `orden`). Validación con `zodResolver` (`src/lib/producto-schema.ts`): precios `z.coerce.number()`, `precioTransferencia` opcional ""→undefined, `stock` int ≥ 0 default 0. Slug autogenerado con `generarSlug` (`src/lib/slug-utils.ts`) y override manual. Imágenes: se suben al bucket público `productos` (ruta `productos/<slug>/variante-N/<uuid>.<ext>`), JPG/PNG/WebP/AVIF, máx 2 MB. Utilidades compartidas de upload/borrado en `src/lib/upload-utils.ts` (`subirImagenSupabase`, `borrarImagenSupabase`, `rutaDesdePublicUrl`). ⚠️ Pendiente: **usuario debe ejecutar (o re-ejecutar) `supabase/storage_bucket.sql`** en el SQL Editor — ahora es idempotente e incluye la policy de **delete** (necesaria para reemplazar imágenes).
  * [x] **CRUD de Líneas (`/admin/lineas`):** Tabla de líneas/colecciones con alta, edición y eliminación. Server Component (`src/app/admin/(panel)/lineas/page.tsx`) que consulta Prisma (líneas con `tipo` y `_count.productos`) + managers client con dialogs (`src/components/admin/lineas-manager.tsx` y `tipos-manager.tsx`, componente `dialog` base-nova). Server Actions en `src/app/admin/(panel)/lineas/actions.ts` (guard `esAdmin` + zod `src/lib/linea-schema.ts`): `crearLinea`, `actualizarLinea`, `eliminarLinea`, `reordenarLineas`, `crearTipo`, `renombrarTipo`, `eliminarTipo`. **Regla de negocio:** al borrar una línea con productos se exige elegir a dónde moverlos (transacción `updateMany(lineaId) + delete`); los Tipos con líneas no se pueden eliminar. **Orden:** se asigna automáticamente (`max+1`, sin campo en el form) y se edita por **drag & drop** con `@dnd-kit/core` + `@dnd-kit/sortable` (action `reordenarLineas` reasigna `orden = índice` en transacción); la lista se ordena `[{ orden: "asc" }, { nombre: "asc" }]`. **Imagen de línea:** upload a `productos/lineas/<uuid>.<ext>` (mismo mecanismo que producto, con `upload-utils`) + "o pegá una URL" como alternativa; al reemplazar o quitar se **borra el archivo anterior** del bucket (`esImagenDelBucket` evita borrar URLs externas). `revalidatePath` sobre `/admin/lineas`, `/admin/productos/nuevo` y `/catalogo`. Sidebar admin: item "Líneas".
  * [x] **Gestión de Tipos:** pestaña dentro de `/admin/lineas`. Alta/renombrado de Tipos (agrupación de líneas, ej. "Anteojo de Sol", "Clip-on"); borrado protegido si tiene líneas asignadas.
* [x] **Configuración Global (`/admin/configuracion`):** página del panel para editar la tabla `Configuracion` (clave-valor) sin tocar código: cantidad de cuotas (`cuotas_cantidad`), cuotas con interés (`cuotas_con_interes`) y días de la etiqueta "NUEVO" (`dias_producto_nuevo`). Server actions en `src/app/admin/(panel)/configuracion/actions.ts` (guard `esAdmin` + zod `src/lib/configuracion-schema.ts`): `obtenerConfiguracionAdmin` y `guardarConfiguracion` (upserts en `$transaction` + `revalidatePath` de `/`, `/catalogo` y `/admin/configuracion`). Form cliente `src/components/admin/configuracion-form.tsx` (react-hook-form + `Switch` base-nova). Seed idempotente de defaults en `supabase/configuracion_defaults.sql` (3 cuotas sin interés, 21 días). La lectura pública vive en `obtenerConfigGlobal` (`src/lib/config-utils.ts`). Sidebar admin: item "Configuración".

* [ ] **Módulo de Gestión de Órdenes (`/admin/ordenes`):**
  * [x] **Lista de pedidos (`/admin/ordenes`):** Server Component `force-dynamic` con guard `esAdmin` (`src/app/admin/(panel)/ordenes/page.tsx`) que lista las órdenes **ordenadas por fecha desc** y aplica los filtros de la URL. Filtrado híbrido como productos: buscador (debounce 300ms) por **N° de pedido, nombre o email** + filtro por **estado** (`ESTADOS_ORDEN`, los 7 valores del enum, incluye `LISTO_PARA_RETIRAR`). Tabla cliente TanStack v8 (`src/components/admin/ordenes-table.tsx` + `ordenes-columns.tsx`) con **badges de estado coloreados** (`CLASES_COLOR_ESTADO`), badges de Pago/Envío (`ETIQUETAS_PAGO`/`ETIQUETAS_ENVIO` en `src/lib/orden-utils.ts`), ordenamiento por Pedido/Fecha/Total y columna **Acciones** con link al detalle (`/admin/ordenes/[id]`), dejando la tabla estructuralmente lista para el próximo ítem. Helpers de formato compartidos en `src/lib/format-utils.ts` (`formatearPesos`/`formatearFecha`; refactor menor en `productos-columns.tsx`). Sidebar admin: item "Órdenes" activado (antes "próximamente").
  * [x] **Vista de Detalle de Orden (`/admin/ordenes/[id]`):** Server Component `force-dynamic` con guard `esAdmin` y `notFound()` (`src/app/admin/(panel)/ordenes/[id]/page.tsx`) organizado en **Cards de Shadcn**: desglose de productos con **snapshot de precio/variante** (nombre, color, `cantidad × precioUnitario`, subtotal), **datos de contacto + DNI**, **dirección de envío/retiro** (logística) y **resumen financiero** (subtotal, descuento, costo de envío, total). Cabecera con `Pedido #N`, badges de estado/pago/envío y link "Volver a órdenes". Formulario cliente `src/components/admin/orden-estado-form.tsx` (rol de seguridad: **CANCELADO** pide confirmación con `AlertDialog`; **DESPACHADO** con envío exige `trackingNumber`; **RETIRO_LOCAL** deja el input de tracking `disabled`). Server Action `actualizarEstadoOrden` (`src/app/admin/(panel)/ordenes/actions.ts`) **revalida en el servidor** la regla de DESPACHADO+tracking leyendo la orden actual (`metodoEnvio`) antes del `update`, y rechaza con error amigable si falta. Schema: nuevo campo nullable `Orden.trackingNumber` (migración `agregar_tracking_orden`, `src/lib/orden-schema.ts` con zod `estadoOrdenSchema`).

Todo implementado y verificado (tsc + lint OK). Falta el build de producción y el commit del módulo. Recomendación para probarlo: crear una orden real por checkout (`/checkout`) y abrir `/admin/ordenes/[id]` para cambiar estado y guardar tracking.

#### **3. Integración de Pasarela de Pago Online (Mercado Pago)**

* [x] **Configuración del SDK y Entorno:**
  * [x] Instalación de `mercadopago` (Node.js SDK, v3.x) en el backend de Next.js (+ `server-only` para que el access token nunca llegue al bundle del cliente). Wrapper `src/lib/mercadopago.ts` con `getMercadoPagoConfig()` / `getMercadoPagoPublicKey()` (estilo `supabase/server.ts`: lanza error claro si falta el token).
  * [x] Configuración de variables de entorno privadas (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`) documentadas en `.env.example` con placeholders; credenciales locales pendientes (completar con valores `TEST-...` en desarrollo).

* [ ] **Generación de Preferencias de Pago:**
  * [ ] Creación de Server Action / API Route `/api/checkout/preference` que recibe la `Orden` creada en la Fase 2.
  * [ ] Mapeo de items, precios reales consultados en la BD (validación backend contra manipulaciones del cliente) y datos del comprador.
  * [ ] Redirección del usuario al checkout seguro de Mercado Pago (*Redirect* o *Modal Overlay*).

* [ ] **Procesamiento de Webhooks & Confirmación de Pagos (`/api/webhooks/mercadopago`):**
  * [ ] Endpoint seguro (API Route) preparado para recibir las notificaciones push de Mercado Pago (`payment.created`, `payment.updated`).
  * [ ] Validación de firmas / tokens de seguridad para evitar peticiones maliciosas.
  * [ ] **Lógica de negocio post-pago:**
    * [ ] Actualizar el estado de la `Orden` en Supabase de `PENDIENTE` a `PAGADO`.
    * [ ] **Descontar automáticamente el stock** de las `Variantes` compradas.
    * [ ] Enviar e-mail de confirmación de compra al cliente (vía Resend / SendGrid / Nodemailer).

> ⚠️ **Requisito de idempotencia en el pago:** Mercado Pago reenvía notificaciones (retries) y puede llegar duplicada la misma; el flujo post-pago debe ser **idempotente** para garantizar que un pago jamás se registre dos veces (ni se descuente stock dos veces, ni se dupliquen e-mails):
>   * Guardar `mpPaymentId` en la `Orden` (ya existe en el modelo, `schema.prisma`) con **`@unique`** y validar con `findUnique` antes de aplicar la actualización.
>   * Transición de estado **guardada**: solo `PENDIENTE → PAGADO` (transacción condicional); si ya está `PAGADO`, ignorar la notificación.
>   * Confirmar el pago contra la API de Mercado Pago (no confiar solo en el payload del webhook) y descontar stock con `updateMany` condicional (stock ≥ cantidad).

#### **4. Resolución de Logística y Envíos Nacionales (Decisión B5)**

* [ ] **Integración de Cotización Real:**
  * [ ] Conectar el calculador de envíos (PDP/Checkout) a la API del proveedor seleccionado (ej. **Shipnow**, **Andreani** o **Correo Argentino**).
  * [ ] Reemplazar la función de tarifas mock (`envio-utils.ts`) por una llamada al servidor que consulte la tarifa en tiempo real según el Código Postal y el peso/volumen estimado del paquete.

* [ ] **Generación de Etiquetas y Despacho:**
  * [ ] Al marcar una orden como `EN_PREPARACION` en el panel admin, invocar la API del transportista para generar la etiqueta de despacho imprimible (*Shipping Label*) y obtener la URL/Código de seguimiento.

---

### 📍 Detalle de la FASE 4: Pruebas, Despliegue & Entrega

El objetivo de la fase final es asegurar la calidad técnica, el cumplimiento normativo legal argentino y realizar el traspaso formal de la plataforma al cliente.

#### **1. Pruebas de Extremo a Extremo (E2E) & Auditoría**

* [ ] **Simulación de Compras (Sandbox Mercado Pago):**
  * [ ] Verificación del flujo completo con tarjetas de prueba (*Test Cards*):
    * [ ] Flujo A: Compra con Tarjeta Aprobada ➔ Verificación de actualización a `PAGADO` en BD y descuento de stock.
    * [ ] Flujo B: Compra Rechazada ➔ Verificación de cancelación de orden y mantenimiento de stock.
    * [ ] Flujo C: Compra por Transferencia Bancaria ➔ Verificación de instrucciones CBU reales y aprobación manual desde el panel admin.

* [ ] **Auditoría de Experiencia de Usuario (UI/UX) y Rendimiento:**
  * [ ] Verificación de carga responsiva en smartphones reales (iOS Safari y Android Chrome).
  * [ ] Pruebas de velocidad de carga con Google Lighthouse (Puntajes > 90 en Performance y SEO).
  * [ ] Validación del comportamiento de Toasts (Sonner), Skeletons de carga al consultar la BD real y resiliencia sin conexión.

#### **2. Puesta en Producción & Configuraciones Finales**

* [ ] **Carga Inicial del Catálogo Real:**
  * [ ] Asistencia al cliente para el alta de las primeras líneas, productos, precios, colores/materiales y fotografías reales en alta resolución.

* [ ] **Verificación de Requisitos Legales (Argentina):**
  * [ ] Confirmación de inserción del script/QR interactivo de **Data Fiscal (Formulario 960/D)** en el footer.
  * [ ] Verificación del correcto funcionamiento del **Botón de Arrepentimiento** (`/boton-de-arrepentimiento`) y recepción de solicitudes de cancelación en el panel/e-mail de la óptica.
  * [ ] Publicación final de las páginas de Términos y Condiciones y Políticas de Privacidad.

* [ ] **Configuración de Dominio y Producción:**
  * [ ] Vinculación del dominio propio comercial (ej. `laoptica.com.ar`) en el panel de Vercel.
  * [ ] Configuración de registros DNS (A, CNAME) y emisión de certificados SSL HTTPS.
  * [ ] Cambio de las credenciales de Mercado Pago de modo *Sandbox/Testing* a modo *Producción*.

#### **3. Capacitación y Traspaso de Propiedad**

* [ ] **Manual de Uso para el Personal de la Óptica:**
  * [ ] Guía paso a paso sobre cómo cargar nuevos productos, pausar modelos sin stock, revisar compras recibidas y cambiar estados de envío.

* [ ] **Traspaso de Accesos e Infraestructura:**
  * [ ] Invitación/Transferencia de roles de *Owner* en la Organización de Vercel, proyecto de Supabase y repositorio de GitHub.
  * [ ] Cierre formal del proyecto y entrega del software.
