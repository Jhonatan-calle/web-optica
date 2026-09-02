# Documento de Especificación de Requisitos de Software (SRS)

**Proyecto:** Plataforma E-commerce — **La Óptica**
**Versión:** 1.0 (Completa / Post-Validación)
**Fecha:** Septiembre de 2026

---

## 1. Visión General

### 1.1 Propósito

El propósito de este documento es definir las especificaciones funcionales y no funcionales para el desarrollo de la plataforma de comercio electrónico de **La Óptica**. La solución busca digitalizar el catálogo de productos, automatizar la gestión y toma de pedidos a nivel nacional y centralizar las ventas sin depender de la mensajería privada en redes sociales (Instagram).

### 1.2 Alcance del Sistema

- **Cobertura Geográfica:** envíos a todo el país mediante empresas de logística nacional y entregas locales con logística propia dentro de la ciudad.
- **Catálogo:** exhibición y venta de anteojos organizados por **Líneas / Colecciones** con múltiples **variantes** (color/material), además de accesorios (clip-ons, estuches, líquidos). En esta fase **no** se incluye la carga ni procesamiento de recetas médicas/graduación (postergado para fases futuras).
- **Integración de Canales:** enlace directo desde el perfil oficial de Instagram para la conversión de tráfico hacia la web.
- **Gestión de Stock:** manejo exclusivo de inventario para el e-commerce (sin sincronización automática con el sistema del punto de venta físico en la primera etapa).

---

## 2. Tipos de Usuarios y Roles

| Rol | Descripción y Permisos |
| --- | --- |
| **Visitante (Anónimo)** | Puede navegar por el catálogo, filtrar por líneas/colecciones, ver detalles del producto, agregar artículos al carrito de compras e iniciar/completar el proceso de pago sin necesidad de crear una cuenta (*Guest Checkout*). |
| **Cliente Registrado** | Mismas capacidades que el visitante, sumando la posibilidad de acceder a un perfil privado para consultar el historial de pedidos, guardar direcciones de envío y dar seguimiento al estado de sus compras. |
| **Administrador** | Acceso al panel privado de administración (Backoffice) para gestión de inventario, precios, categorización de productos, visualización de ventas y actualización del estado logístico de los pedidos. |

---

## 3. Requisitos Funcionales (RF)

### 3.1 Catálogo y Productos

- **RF-01 (Estructuración de Catálogo):** el sistema debe permitir agrupar los anteojos por **Líneas/Colecciones** y categorías de accesorios.
- **RF-02 (Manejo de Variantes):** cada modelo de anteojo debe soportar múltiples variantes (diferenciadas por color y/o material), cada una con su propio nivel de stock e imágenes asociadas.
- **RF-03 (Filtros y Búsqueda):** los usuarios deben poder filtrar por línea, tipo de producto (anteojos, clip-ons, accesorios) y precio.

### 3.2 Carrito y Proceso de Compra (Checkout)

- **RF-04 (Persistencia del Carrito):** el carrito de compras debe persistir los artículos seleccionados en el navegador del usuario aunque se recargue la página.
- **RF-05 (Guest Checkout):** se debe permitir la compra sin registro previo. Durante el checkout se solicitará obligatoriamente un correo electrónico de contacto.
- **RF-06 (Registro Opcional Post-Compra):** al finalizar la orden, el sistema ofrecerá al cliente la opción de crear una contraseña para registrarse; de hacerlo, la orden realizada se vinculará automáticamente a su nuevo historial.

### 3.3 Envíos y Métodos de Entrega

- **RF-07 (Cálculo de Envíos Nacionales):** integración con calculador de tarifas en tiempo real para envíos nacionales (Correo Argentino, Andreani, OCA, Shipnow) en función del código postal.
- **RF-08 (Logística Local):** opción de envío a domicilio con cadetería/logística propia para compras dentro de la ciudad.
- **RF-09 (Retiro en Tienda Física):** opción de selección de retiro presencial en el local de la óptica sin costo de envío.

### 3.4 Medios de Pago

- **RF-10 (Pagos Online):** procesamiento de pagos con tarjeta de crédito, débito y dinero en cuenta mediante pasarela de pago (Mercado Pago o equivalente).
- **RF-11 (Pago en Local):** opción de seleccionar "Pago al retirar en el local" cuando se elige la modalidad de retiro presencial.

### 3.5 Panel de Administración (Backoffice)

- **RF-12 (Gestión de Productos - CRUD):** el administrador podrá crear, editar, pausar o eliminar productos, variantes, precios y fotografías.
- **RF-13 (Gestión de Inventario):** control de stock asignado al e-commerce con actualización automática ante cada compra confirmada.
- **RF-14 (Gestión de Órdenes):** panel para consultar compras recibidas y actualizar estados del pedido (ej. *Pendiente*, *Pagado*, *En preparación*, *Despachado*, *Listo para retirar*, *Entregado*).

---

## 4. Requisitos Legales y Normativos (Argentina)

- **RL-01 (Data Fiscal):** inclusión obligatoria del código QR interactivo de la agencia de recaudación (Formulario 960/D) visible en el *footer* de todas las páginas del sitio web.
- **RL-02 (Botón de Arrepentimiento):** inclusión de un enlace o botón visible en la página principal/footer para la revocación de la compra dentro del plazo legal de 10 días corridos.
- **RL-03 (Documentación Legal):** secciones dedicadas y accesibles para los **Términos y Condiciones de Uso** (incluyendo políticas de cambio/devolución acordes a la ley argentina) y las **Políticas de Privacidad/Protección de Datos Personales**.
- **RL-04 (Transparencia de Precios):** todos los precios mostrados deben ser finales e incluir IVA expresado en Pesos Argentinos (ARS).

---

## 5. Requisitos No Funcionales (RNF)

- **RNF-01 (Rendimiento y SEO):** el catálogo y las páginas de producto deben cargar en menos de 2 segundos mediante pre-renderizado (SSR/SSG), optimizando la indexación en motores de búsqueda.
- **RNF-02 (Seguridad):** toda la navegación y transferencia de datos deben ejecutarse bajo protocolo HTTPS seguro con certificados SSL.
- **RNF-03 (Control de Accesos):** protección de rutas y endpoints de API mediante autenticación basada en roles (`CLIENT` / `ADMIN`), restringiendo la modificación de datos a usuarios no autorizados.
- **RNF-04 (Diseño Responsive):** la interfaz debe adaptarse de manera óptima a dispositivos móviles (smartphones) y de escritorio, con especial enfoque en la usabilidad desde dispositivos móviles (tráfico proveniente de Instagram).
