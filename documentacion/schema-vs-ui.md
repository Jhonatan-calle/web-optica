# Schema de Base de Datos vs. UI — Brechas de Datos

> **Propósito de este documento:** es autocontenido para que cualquier persona (aunque no conozca el proyecto ni el código) pueda entender cómo se relaciona la base de datos con la interfaz de usuario, y pueda dar su opinión sobre las decisiones pendientes que se listan al final.
>
> Revisado: Fase 2 (Tienda Pública). Este documento se actualizará cuando se conecte la base de datos real.

---

## 1. Contexto del proyecto (para quien no lo conoce)

**"La Óptica"** es una óptica que vende **anteojos de sol, clip-ons, armazones (lentes recetados) y accesorios**. Estamos construyendo su **tienda en línea (e-commerce)**.

La tienda permite al cliente:
- Navegar por **catálogo** y filtrar productos.
- Ver el **detalle de un producto** (fotos, colores/materiales disponibles, precio, envío).
- **Agregar productos al carrito** y (en el futuro) pagar.

### Stack técnico (resumen)
- **Next.js** (framework de React) + **TypeScript**.
- **Base de datos PostgreSQL** administrada con **Prisma** (un "mapeador" que permite definir tablas en un archivo y consultarlas desde el código).
- La interfaz se construye con **Tailwind CSS** y componentes de **Shadcn/Base UI**.

### Cómo se ven los datos hoy
- **Base de datos:** ya existe un **diseño de tablas** (schema), pero **todavía no está cargada con productos**.
- **Interfaz:** mientras tanto, la interfaz usa **datos de prueba (mock)** escritos a mano en el código, para poder diseñar y validar la UI.

> Conclusión de este párrafo: el objetivo de este documento es revisar que, cuando carguemos los datos reales, **todo lo que la interfaz muestra tenga dónde guardarse** en la base de datos.

---

## 2. Modelo de negocio (unidades de lo que se vende)

- **Línea / Colección:** una agrupación de productos (ej. "Línea Sun", "Línea Clip-on", "Línea Recetados").
- **Producto:** un artículo concreto (ej. "Anteojo de Sol Classic").
- **Variante:** una versión específica de ese producto según **color y/o material** (ej. el mismo anteojo en "Negro/Acetato" y en "Carey/Metal"). Cada variante puede tener su propio **precio y stock**.
- **Imagen:** fotos asociadas a una variante.
- **Pedido (Orden) / ítem del pedido:** la compra que hace un cliente y cada producto comprado dentro de ella.

---

## 3. El modelo de datos actual (traducido a lenguaje claro)

Tablas principales ya definidas en la base de datos:

| Tabla | Para qué guarda | Relaciones |
|---|---|---|
| **Linea** | Las líneas/colecciones (nombre, descripción, orden). | Una Línea tiene muchos Productos. |
| **Producto** | Cada artículo (nombre, slug/url, descripción, destacado, activo). | Pertenece a una Línea; tiene muchas Variantes. |
| **Variante** | Versiones por color/material, con precio, precio de transferencia y stock. | Pertenece a un Producto; tiene muchas Imágenes. |
| **Imagen** | URL de cada foto. | Pertenece a una Variante. |
| **Orden** | Una compra (datos del cliente, envío, método de pago, totales). | Tiene muchos ítems. |
| **ItemOrden** | Cada producto dentro de una orden, con un "snapshot" (copia) del nombre/color/precio en el momento de la compra. | Pertenece a una Orden y a una Variante. |
| **Usuario** | Cuentas (cliente/admin). | Tiene direcciones y órdenes. |

**Este modelo central está bien diseñado** y corresponde casi perfectamente con lo que vemos en la interfaz. No hace falta rediseñar esta estructura.

---

## 4. Mapeo UI ↔ Base de datos (lo que ya corresponde bien)

La siguiente tabla confirma que varios elementos de la interfaz ya tienen su lugar en la base de datos:

| Elemento de la interfaz | Dónde se guardaría |
|---|---|
| Nombre de la línea/colección (en el home y catálogo) | `Linea.nombre` |
| Nombre del producto y su URL (`/producto/<slug>`) | `Producto.nombre`, `Producto.slug` |
| Precio y "precio por transferencia" | `Variante.precio`, `Variante.precioTransferencia` |
| Color y material seleccionables en el detalle | `Variante.color`, `Variante.material` |
| Foto de producto/variante | `Imagen.url` |
| Etiqueta de descuento "10% OFF" | **Se calcula** (diferencia entre precio y precio de transferencia), no se guarda como texto. |
| Etiqueta "NUEVO" | **Se calcula** (según la fecha de creación del producto), no se guarda como texto. |
| Carrito / compra | Tabla `ItemOrden` guarda una "copia instantánea" del producto vendido (patrón consistente con la interfaz). |

---

## 5. Las brechas: datos de la interfaz que NO tienen dónde guardarse

Estos son los puntos que **aparecen en la interfaz hoy, pero que no existen en el modelo de datos**. Están como "datos de prueba escritos a mano" o como texto de relleno. **Hay que decidirlos antes de cargar los datos reales.**

Para cada brecha se indica: **dónde aparece** · **cómo está hoy** · **recomendación** · **estado**.

---

### B1 — Imagen/portada de cada Línea o Colección

- **Dónde aparece:** en el home, el bloque de "Colecciones" muestra una imagen/portada por cada línea.
- **Cómo está hoy:** se usa un logo de relleno (placeholder). La tabla `Linea` **no tiene ningún campo de imagen**.
- **Recomendación (a confirmar):** agregar un campo `imagen` a la tabla `Linea` para guardar la URL de su portada.
- **Estado:** 🔶 PENDIENTE DE DEFINIR (solución simple, pero hay que confirmarla).

---

### B2 — Texto de cuotas ("3 cuotas sin interés de $19.334")

- **Dónde aparece:** en las tarjetas de producto (home y catálogo) y en el detalle (PDP).
- **Cómo está hoy:** es un **texto fijo escrito a mano** en los datos de prueba (ej. "3 cuotas sin interés de $19.334"). No hay un campo ni una lógica de cuotas.
- **Recomendación (a confirmar):** **calcularlo** automáticamente a partir del precio y una configuración de cuotas (cantidad de cuotas, con/sin interés), igual que se hace con el descuento. Habría que definir si la cantidad de cuotas (ej. 3) es un valor fijo de la tienda o configurable por producto.
- **Estado:** 🔶 PENDIENTE DE DEFINIR (cálculo vs. configuración).

---

### B3 — Dimensiones y Garantía del producto (en el detalle/PDP)

- **Dónde aparece:** en el detalle de producto, dentro de los acordeones "Dimensiones" y "Garantía".
- **Cómo está hoy:** son campos de texto de relleno en los datos de prueba. La tabla `Producto` **no tiene estos campos**.
- **Recomendación:** agregar campos `dimensiones` (texto) y `garantia` (texto) a la tabla `Producto`.
- **Estado:** 🟢 SOLUCIÓN PROPUESTA CLARA (agregar dos columnas de texto opcionales).

---

### B4 — "Tipo de Producto" (filtro del catálogo)

- **Dónde aparece:** en el catálogo se puede **filtrar por "Tipo de Producto"** (ej. "Anteojo de Sol", "Clip-on", "Armazón"). También se muestra en el detalle y en las tarjetas.
- **Cómo está hoy:** el tipo es un **campo escrito a mano** en los datos de prueba. La tabla `Producto` **no tiene este campo**.
- **Por qué importa:** este es el punto que más necesita una decisión de diseño de datos, porque hay dos opciones posibles:
  - **Opción A:** agregar un campo `tipo` a `Producto` (texto o enumerado de tipos).
  - **Opción B:** considerar que el "tipo" ya está cubierto por la "Línea" (y no duplicar conceptos).
    - ⚠️ Nota: hoy "Línea" y "Tipo" están algo superpuestos en los datos de prueba (por ej., tanto "Anteojo de Sol" como la "Línea Sun" se refieren a lo mismo).
- **Recomendación (a confirmar):** definir una **tabla de tipos única** o un **campo `tipo`** en `Producto`, asegurando que no se duplique con "Línea". Decisiones así convienen tomarlas ahora.
- **Estado:** 🔴 REQUIERE DECISIÓN DE DISEÑO (la más importante de la lista).

---

### B5 — Tarifas de envío por Código Postal

- **Dónde aparece:** en el detalle de producto hay un **calculador de envío**: el usuario ingresa su código postal y se muestra un costo estimado.
- **Cómo está hoy:** las tarifas están **escritas a mano en el código** (una tabla de rangos de código postal → precio). La base de datos guarda el costo final del envío en cada "Orden", pero **no modela las tarifas/transportistas**.
- **Recomendación (a confirmar):** decidir de dónde salen las tarifas en el modelo real. Opciones:
  - **Opción A:** modelar una tabla de tarifas propia (rangos de CP + costo) en la base de datos.
  - **Opción B:** integrar una **API de envío externa** (ej. transportista) que calcule el costo.
- **Estado:** 🔴 REQUIERE DECISIÓN (solo afecta cuando se integre el envío real; por ahora el estimado mock alcanza).

---

## 6. Resumen de decisiones pendientes (checklist)

Letras de referencia para discutirlas por nombre.

- [ ] **B1 — Imagen de Línea:** ¿agregar campo `imagen` a `Linea`? 
- [ ] **B2 — Cuotas:** ¿calcularlas desde el precio + configuración de cuotas? ¿las cuotas son fijas de la tienda o por producto?
- [ ] **B3 — Dimensiones y Garantía:** agregar campos `dimensiones` y `garantia` a `Producto`. 
- [ ] **B4 — Tipo de Producto:** ¿campo/tabla de tipos, o derivarlo de "Línea"? *(requiere decisión de diseño)*
- [ ] **B5 — Envío:** ¿tabla de tarifas propia o API externa de transporte?

> Cuando estas decisiones estén tomadas, se actualiza el modelo de datos y este documento, y se conecta la interfaz a la base de datos real (reemplazando los datos de prueba).

---

## 7. Referencia al resto del proyecto

- **Modelo de datos real:** `prisma/schema.prisma`
- **Datos de prueba (mock):** `src/lib/mock-products.ts`
- **Roadmap / fases:** `documentacion/workFlow.md`
- **Guía estética (UI):** `documentacion/guiaEstetica.md`
- **Archivos de UI donde aparecen estas brechas:** home (`collections.tsx`), catálogo (`catalog-filters.tsx`, `product-card.tsx`), detalle (`product-info.tsx`).
