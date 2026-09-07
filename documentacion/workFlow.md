### 🗺️ Estructura General del Proyecto (Roadmap de 4 Fases)

* **Fase 1: Descubrimiento & Configuración Base**
* **Fase 2: Desarrollo Core (Tienda Pública)** *(En la que estamos)*
* **Fase 3: Panel Administrativo & Integraciones (Pagos/Envíos)**
* **Fase 4: Pruebas, Despliegue & Entrega**

> ✅ **Los mocks y la UI ya están reformateados a la forma del modelo de datos** (jerarquía `Tipo → Linea → Producto → Variante → Imagen`). Los helpers de cuotas/badges ya existen en `src/lib/product-utils.ts`: `calcularCuotas`, `calcularBadge` y `MOCK_CONFIG`. *No hay que reimplementarlos.*
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
* [x] **Footer Completo (Requisitos Legales):**
  * [x] Columnas de navegación secundaria y redes sociales (`@_laoptica`).
  * [ ] Crear páginas legales con contenido: **Términos y Condiciones** (`/terminos-y-condiciones`) y **Políticas de Privacidad/Cambios** (`/politicas-de-privacidad`).
  * [ ] Crear página del **Botón de Arrepentimiento** (`/boton-de-arrepentimiento`) con formulario de solicitud de cancelación (plazo legal de 10 días corridos).
  * [ ] Completar **Data Fiscal (Formulario 960/D)**: obtener código/QR de la agencia de recaudación e insertarlo en el footer (por ahora hay placeholder).

#### **2. Páginas de la Tienda (UI/UX & Routing)**

* [x] **Home / Landing Page (`/`):**
  * [x] *Hero Section:* Banner principal con mensaje de marca ("Encontrá tu marco ideal") y CTA "Ver Catálogo".
  * [ ] Reemplazar el placeholder del hero (isologo sobre fondo `#F9FAFB`) por la **foto lifestyle real** con modelos de marca, en alta resolución. Por ahora el hero usa un placeholder visual a la espera del asset.
  * [x] *Carousel/Grid de Colecciones:* Acceso directo a las líneas destacadas.
  * [ ] Conectar las colecciones y productos destacados de la home a la base de datos (en Supabase/Prisma) cuando exista el catálogo. Por ahora usan datos/imágenes mock.
    * Las etiquetas de las cards se **calculan** (Opción A), NO se guardan como texto:
      * **"10% OFF" / descuento** = derivado de la diferencia entre `Variante.precio` y `Variante.precioTransferencia` (ej. `100 * (1 - precioTransferencia / precio)`).
      * **"NUEVO"** = derivado de la antigüedad del `Producto.createdAt`. Umbral de días **por definir (N)** — ⚠️ *queda pendiente fijar N y anotarlo acá.*
  * [ ] Reemplazar los placeholders de imagen (isologo sobre `#F9FAFB`) de las cards por las **imágenes reales de cada línea/colección**.
  * [x] *Grid de Productos Destacados:* Cards de productos más vendidos, con "Agregar al Carrito" (datos mock por ahora).
  * [x] *Banner de Valor:* Bloque con beneficios ("Envío Nacional", "3 Cuotas Sin Interés", "Retiro Gratis en Local").
* [ ] **Catálogo Completo / Colecciones (`/catalogo` o `/aros`):**
  * [x] Filtros horizontales por Línea/Colección, Material y Tipo de Producto (+ orden por precio). Con datos mock y estado local.
  * [x] Grid responsivo (2 columnas en Mobile, 3-4 en Desktop).
  * [x] Cards de Producto (componente `ProductCard` reutilizable) con contenedor `bg-[#F9FAFB]`, badges ("10% OFF", "NUEVO"), stack de precios (Lista vs. Transferencia) y desglose de cuotas.
  * [ ] Conectar el catálogo a la base de datos (Línea/Variante reales en Supabase/Prisma) y reemplazar los datos/imágenes mock. Implementar también el cálculo real de etiquetas (Opción A: descuento desde `precio`/`precioTransferencia`, "NUEVO" desde `createdAt` con umbral N por definir).
* [ ] **Página de Detalle de Producto - PDP (`/producto/[slug]`):**
  * [x] Galería de fotos con imágenes en alta resolución (placeholders / isologo por ahora).
  * [x] Selector de variantes por color/material mediante *swatches* / pills de color (con variantes mock).
  * [x] Calculador interactivo de envíos por Código Postal (tabla de tarifas mock por rango de CP; pendiente API real/transportistas).
  * [x] Acordeones colapsables (Shadcn Accordion) para dimensiones de los armazones, materiales y garantía (contenido placeholder por ahora).
  * [x] Botón principal "Agregar al Carrito" (usa `useCartStore`; sin toast aún, queda para la fase de carrito).
  * [ ] Reemplazar imágenes placeholder (isologo) por las **fotos reales** de cada producto/variante y conectar a la BD cuando exista el catálogo real.

#### **3. Carrito de Compras & Estado Global (Zustand)**

* [x] **Cart Drawer (Slide-over Sheet):**
  * Panel desplegable lateral al hacer clic en el ícono del carrito o agregar un producto.
  * Lógica de actualización de cantidad (`+` / `-`), eliminación de ítems y vaciado de carrito.
  * Almacenamiento tipo **Snapshot** (precio congelado, título, variante, imagen y cantidad) persistido en `localStorage` mediante Zustand (`useCartStore`).
* [ ] **Manejo de Feedbacks Visuales:**
  * [x] **Toasts de notificación (Sonner):** `<Toaster />` montado en `src/app/layout.tsx`; helper `showAddToCartToast` en `src/components/cart/add-to-cart-toast.tsx`. Se dispara al agregar desde `ProductCard` y `ProductInfo`.
  * [x] **Estados vacíos (*Empty States*):** carrito sin ítems (`cart-drawer.tsx`) y catálogo sin resultados de filtros/búsqueda (`catalogo/page.tsx`, distingue búsqueda vs. filtros).
  * [x] **Búsqueda en catálogo:** campo de búsqueda en `catalog-filters.tsx` filtrando por nombre en `catalogo/page.tsx`.
  * [x] **Skeletons de carga:** componentes `src/components/ui/skeleton.tsx` y `src/components/catalog/product-card-skeleton.tsx` creados. 
	  * [ ] ⚠️ **Pendiente de testear**: aún NO se renderizan en ningún lado porque la UI usa mocks síncronos. Al conectar la UI a la BD (reemplazar `MOCK_PRODUCTOS`), usar `ProductCardSkeleton` en el grid del catálogo mientras se consultan los productos.

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
  * Implementado en `src/components/checkout/pago-form.tsx` + paso 3 del stepper en `src/app/checkout/page.tsx`. Los datos se persisten en `src/lib/checkout-store.ts` (`pago`, localStorage). Los totales (subtotal/descuento por transferencia/envío/total) se calculan con `src/lib/pago-utils.ts` (`calcularTotales`); el descuento por transferencia usa el snapshot `precioTransferencia` del carrito (`src/lib/cart-store.ts`), las cuotas (3 sin interés) solo aplican a Pago Online (`calcularCuotas`). El CBU/Alias/titular viven (placeholder `EDITAR`) en `src/lib/tienda-info.ts`. Efectivo en local solo disponible si la entrega es retiro (RF-11). Enum `MetodoPago` extendido con `TRANSFERENCIA` en `prisma/schema.prisma` (migración `agregar-transferencia-metodo-pago`), listo para mapear la orden.
* [ ] ⚠️ **Pendiente (dato real):** completar `ALIAS_LA_OPTICA`, `CBU_LA_OPTICA` y `TITULAR_CUENTA` en `src/lib/tienda-info.ts` — hoy son placeholders `EDITAR` y son necesarios para que la opción "Transferencia Bancaria" funcione de verdad.
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
    * **Rol en `app_metadata` (server-side, nunca desde el cliente):** trigger SQL `supabase/rol_app_metadata.sql` (ejecutar 1 vez en el SQL Editor de Supabase). `BEFORE INSERT ON auth.users` setea `app_metadata.rol` (whitelist de emails admin → `ADMIN`, resto → `CLIENT`) y `AFTER INSERT` **crea la fila en `public."Usuario"` (Prisma)** mapeando `id` de auth → id, email y rol (con backfill para usuarios preexistentes). ⚠️ Pendiente: reemplazar la whitelist de emails en ese archivo.
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

* [ ] **Dashboard General (`/admin`):**
  * [ ] Vista de métricas clave: Ventas totales del mes, pedidos pendientes de despacho, stock crítico/bajo y total de órdenes del día.

* [ ] **Módulo de Gestión de Catálogo - CRUD (`/admin/productos` y `/admin/lineas`):**
  * [ ] **Lista de Productos (Data Table con Shadcn):** Tabla con buscador, filtros por línea, estado (`Activo`/`Pausado`) y acciones rápidas.
  * [ ] **Formulario de Creación/Edición de Producto (`/admin/productos/nuevo`):**
    * [ ] Campos base: Nombre, Slug automático, Descripción, Línea asignada (`tipoId` / `lineaId`), Dimensiones y Garantía (B3).
    * [ ] Gestión de Variantes: Alta dinámica de variantes por Color/Material, Precio de Lista, Precio por Transferencia y Stock disponible.
    * [ ] Carga de Imágenes: Integración con Supabase Storage para subir fotografías por variante y obtener URLs públicas.

* [ ] **Módulo de Gestión de Órdenes (`/admin/ordenes`):**
  * [ ] Lista global de pedidos ordenados por fecha con badges de estado: `PENDIENTE`, `PAGADO`, `EN_PREPARACION`, `DESPACHADO`, `ENTREGADO`, `CANCELADO`.
  * [ ] Vista de Detalle de Orden (`/admin/ordenes/[id]`):
    * [ ] Desglose de productos comprados (Snapshot de precio/variante).
    * [ ] Datos de contacto, DNI de facturación y dirección de envío / retiro en local.
    * [ ] Selector para actualizar el estado del pedido y adjuntar el **Número de Seguimiento / Código de Tracking** de la empresa de correo.

#### **3. Integración de Pasarela de Pago Online (Mercado Pago)**

* [ ] **Configuración del SDK y Entorno:**
  * [ ] Instalación de `mercadopago` (Node.js SDK) en el backend de Next.js.
  * [ ] Configuración de variables de entorno privadas (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`).

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
