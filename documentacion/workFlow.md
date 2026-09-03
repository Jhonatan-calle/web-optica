### 🗺️ Estructura General del Proyecto (Roadmap de 4 Fases)

* **Fase 1: Descubrimiento & Configuración Base** *(En la que estamos)*
* **Fase 2: Desarrollo Core (Tienda Pública)**
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
* [ ] Configurar Zustand para la persistencia del carrito en `localStorage`.
* [ ] Desplegar un "Hola Mundo" inicial en Vercel vinculado al repositorio (GitHub) para verificar el pipeline CI/CD desde el día uno.
---
¿Te parece bien la estructura propuesta para la **Fase 1** o te gustaría ajustar/agregar alguna actividad antes de pasar a detallar la **Fase 2 (Desarrollo de la Tienda)**?