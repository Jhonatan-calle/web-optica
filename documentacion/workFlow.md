### 🗺️ Estructura General del Proyecto (Roadmap de 4 Fases)

* **Fase 1: Descubrimiento & Configuración Base**
* **Fase 2: Desarrollo Core (Tienda Pública)** *(En la que estamos)*
* **Fase 3: Panel Administrativo & Integraciones (Pagos/Envíos)**
* **Fase 4: Pruebas, Despliegue & Entrega**

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
* [ ] **Footer Completo (Requisitos Legales):**
  * Columnas de navegación secundaria y redes sociales (`@_laoptica`).
  * Enlaces a páginas legales obligatorias: **Términos y Condiciones** y **Políticas de Privacidad/Cambios**.
  * Enlace visible al **Botón de Arrepentimiento** (con formulario básico de solicitud de cancelación).
  * Código e imagen de **Data Fiscal (Formulario 960/D)** asignado por la agencia tributaria.

#### **2. Páginas de la Tienda (UI/UX & Routing)**

* [ ] **Home / Landing Page (`/`):**
  * *Hero Section:* Banner principal con mensaje de marca ("Encontrá tu marco ideal"), foto lifestyle y CTA "Ver Catálogo".
  * *Carousel/Grid de Colecciones:* Acceso directo a las líneas destacadas.
  * *Grid de Productos Destacados:* Cards de productos más vendidos.
  * *Banner de Valor:* Bloque con beneficios ("Envío Nacional", "3 Cuotas Sin Interés", "Retiro Gratis en Local").
* [ ] **Catálogo Completo / Colecciones (`/catalogo` o `/aros`):**
  * Filtros horizontales por Línea/Colección, Material y Tipo de Producto.
  * Grid responsivo (2 columnas en Mobile, 3-4 en Desktop).
  * Cards de Producto con contenedor `bg-[#F9FAFB]`, badges ("10% OFF", "NUEVO"), hover para segunda imagen, stack de precios (Lista vs. Transferencia) y desglose de cuotas.
* [ ] **Página de Detalle de Producto - PDP (`/producto/[slug]`):**
  * Galería de fotos con imágenes en alta resolución.
  * Selector de variantes por color/material mediante *swatches* o *pills* de color.
  * Calculador interactivo de envíos por Código Postal (preparado con valores mock/estimados antes de la API final).
  * Acordeones colapsables (Shadcn Accordion) para dimensiones de los armazones, materiales y garantía.
  * Botón principal "Agregar al Carrito".

#### **3. Carrito de Compras & Estado Global (Zustand)**

* [ ] **Cart Drawer (Slide-over Sheet):**
  * Panel desplegable lateral al hacer clic en el ícono del carrito o agregar un producto.
  * Lógica de actualización de cantidad (`+` / `-`), eliminación de ítems y vaciado de carrito.
  * Almacenamiento tipo **Snapshot** (precio congelado, título, variante, imagen y cantidad) persistido en `localStorage` mediante Zustand (`useCartStore`).
* [ ] **Manejo de Feedbacks Visuales:**
  * Toasts de notificación (Sonner/Shadcn Toast) al agregar un producto.
  * Estados vacíos (*Empty States*) para carrito sin ítems o búsquedas sin resultados.
  * Skeletons de carga (`<Skeleton/>`) mientras se consultan los productos de la base de datos.

#### **4. Flujo de Checkout sin Registro (Guest Checkout) (`/checkout`)**

* [ ] **Formulario de Datos del Cliente:** Toma de datos obligatorios (Email, Nombre, Teléfono, DNI para facturación).
* [ ] **Selección de Método de Entrega:**
  * Opción 1: Envío a Domicilio (solicita dirección completa y CP).
  * Opción 2: Retiro Gratis en el Local Físico de La Óptica.
* [ ] **Selección de Método de Pago:**
  * Opción 1: Pago Online (preparado para conectar el SDK de Mercado Pago en la Fase 3).
  * Opción 2: Transferencia Bancaria (muestra datos CBU/Alias y aplica descuento automático).
  * Opción 3: Pago en Efectivo al Retirar en el Local.
* [ ] **Página de Confirmación de Pedido (`/orden/[id]`):**
  * Resumen del pedido generado en la base de datos (PostgreSQL/Prisma) con estado "Pendiente de Pago".

---
