# Adaptar los Datos de la UI al Modelo de Base de Datos

> **Propósito:** dejar documentado, para no olvidarnos cuando llegue el momento, **todo** lo que hay que hacer para que **los mocks y la interfaz queden adaptados a la forma en que están guardados los datos en la base de datos**.
>
> ⚠️ **Importante — NO es "conectar a la base de datos".** La conexión real (leer/escribir en Supabase) se hará más adelante. Este documento trata de **reformatear la estructura de los datos de prueba (mock) y la UI que los consume** para que **correspondan con la forma del modelo de datos**, lista para cuando se conecte.

---

## 1. Por qué importa "la forma de los datos"

Hoy la interfaz usa **datos de prueba** en `src/lib/mock-products.ts` que son **planos y mixtos**: un solo objeto mezcla el producto, la línea, el tipo, una "primera variante" (color, material, precio, imagen), las cuotas y el badge. Pero la **base de datos es jerárquica y relacional**, y **cada dato vive exactamente donde vive en la BD** (el precio y la imagen viven en la **Variante**, el nombre/portada en la **Línea**, el tipo en el nivel superior **Tipo**, las cuotas en la **config global**, los badges se **calculan**).

```
Configuracion (clave → valor)     // config global (cuotas)
Tipo (1) → Linea (N) → Producto (N) → Variante (N) → Imagen (N)
```

**Regla de oro que guía todo el reformateo:** imitar esa ubicación. Si el mock sigue plano, cuando llegue el momento de conectar la BD la UI **se tendría que reescribir de golpe**. En cambio, si **reformateamos ahora los mocks para que imiten la estructura de la BD**, la UI queda ya "adaptada a la forma de los datos" y la conexión después será mecánica.

---

## 2. Modelo objetivo (la forma real de los datos)

Referencia: `prisma/schema.prisma`.

- **Tipo**: `id`, `nombre` (ej. "Anteojo de Sol", "Clip-on", "Armazón"). Un Tipo tiene muchas Líneas.
- **Linea**: `id`, `tipoId`, `nombre`, `descripcion`, `imagenUrl` (portada, B1), `orden`. Pertenece a un Tipo; tiene muchos Productos.
- **Producto**: `id`, `lineaId`, `nombre`, `slug`, `descripcion`, `dimensiones`, `garantia`, `destacado`, `activo`, `createdAt`.
- **Variante**: `id`, `productoId`, `color`, `material`, `precio`, `precioTransferencia`, `stock`. Pertenece a un Producto; tiene muchas Imágenes.
- **Imagen**: `id`, `varianteId`, `url`, `alt`, `orden`.
- **Configuracion**: `id`, `clave`, `valor` (ej. `cuotas_cantidad`, `cuotas_con_interes`).

Reglas de negocio a respetar en la forma de los datos:
- El **tipo** de un producto se obtiene subiendo por la jerarquía (`Producto → Linea → Tipo`), **no** se guarda en cada producto.
- El **precio**, **color** y **material** viven en la **Variante** (y la **imagen** en la `Imagen` de esa variante); **no** se guardan duplicados a nivel producto.
- Las **cuotas** son **config global** (`Configuracion`) + **cálculo** a partir del precio; **no** un texto fijo por producto.
- Los **badges** ("10% OFF", "NUEVO") se **calculan**: descuento desde `precio` vs `precioTransferencia`; "NUEVO" desde `createdAt`. No son texto guardado.

---

## 3. Reforma de los mocks — `src/lib/mock-products.ts`

Discrepancias entre el `MockProducto` actual (plano) y la forma real, y cómo debe quedar cada una.

| Campo actual del mock | Problema vs. la BD | Cómo debe quedar (imitar la BD) |
|---|---|---|
| `tipo` (string plano por producto) | En la BD el tipo NO está en el producto; se sube por la jerarquía | **Quitar** `tipo` del producto. Anidarlo en `linea` (ver abajo) |
| `linea` (string plano) | En la BD `Linea` es una **entidad** con `tipo`, `nombre`, `imagenUrl` | Representar `linea` como **objeto** con `{ tipo, nombre, imagenUrl }` |
| `varianteId` (string a nivel producto) | En la BD el id vive en `Variante` | **Renombrar** a `id` y moverlo a cada variaante (`MockVariante.id`). El producto ya no tiene un `varianteId` propio |
| `precio`, `precioTransferencia` a nivel producto | En la BD viven en `Variante` | **Moverlos a cada `MockVariante`**. El producto ya NO los repite |
| `color`, `material` a nivel producto | En la BD viven en `Variante` | **Moverlos a cada `MockVariante`** (ya están en `variantes[]`, dejar de duplicarlos) |
| `imagen` a nivel producto | En la BD vive en `Imagen` (de la variante) | **Moverlo a `MockVariante.imagenes[]`** (lista). El producto usa la imagen de la variante "destacada" (primera) |
| `cuotas` (string fijo "3 cuotas sin interés de $X") | BD: config global + cálculo (B2) | **Quitar** el campo string. Las cuotas salen de un **helper `calcularCuotas(precio)`** que lee la **config global** |
| `badge` (texto "10% OFF" / "NUEVO") | BD: se **calcula** | **Quitar** el texto. Derivarlo (descuento desde precios; "NUEVO" desde `createdAt`) |
| `garantia`, `dimensiones` | BD: viven en `Producto` (✅ ya implementado) | **OK** — ya viven a nivel producto |
| Falta `descripcion` | BD: existe en `Producto` | **Agregar** `descripcion` opcional al mock |
| Falta `destacado` / `activo` | BD: existen en `Producto` | **Agregar** al mock (para saber qué mostrar como "destacado") |
| Falta `createdAt` | BD: existe en `Producto` (para calcular "NUEVO") | **Agregar** `createdAt` al mock |
| Falta `stock` | BD: existe en `Variante` | **Agregar** `stock` a cada `MockVariante` |
| Falta `Configuracion` (cuotas) | No existe en el mock | Definir una **constante/objeto `MOCK_CONFIG`** global con `{ cuotas: { cantidad, conInteres } }` imitando la tabla `Configuracion` |

### Forma propuesta de las interfaces (resultado buscado)

```ts
interface MockImagen {
  url: string;
  alt?: string;
}

interface MockVariante {
  id: string;
  color: string;
  material: string;
  precio: number;
  precioTransferencia?: number;
  stock: number;
  imagenes: MockImagen[];
}

interface MockTipo {
  nombre: string; // "Anteojo de Sol", "Clip-on", "Armazón"
}

interface MockLinea {
  id?: string;            // opcional: idLinea
  nombre: string;         // "Línea Sun"
  imagenUrl?: string;     // portada (B1)
  tipo: MockTipo;         // nivel superior (ver nota)
}

interface MockProducto {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  linea: MockLinea;
  dimensiones: string;
  garantia: string;
  createdAt: string;      // para calcular "NUEVO"
  variantes: MockVariante[];
}

// Config global imitando la tabla Configuracion (B2)
const MOCK_CONFIG = {
  cuotas: { cantidad: 3, conInteres: false },
};
```

**Variante destacada:** se define como la **primera** del array (`producto.variantes[0]`). Se usa su `imagenes[0].url`, `precio` y `color`/`material` para la tarjeta, la galería y el "agregar al carrito" inicial. No se agrega un campo extra.

> **Nota sobre el campo `linea.tipo`:** en la BD la línea no guarda un objeto de tipo; guarda `linea.tipoId` y el `Tipo` es una tabla aparte (relación por FK). En el **mock** se usa un **objeto anidado** `linea.tipo` por ergonomía de la UI (acceso directo), aclarando que es una simplificación: no replica la clave foránea, solo la "forma" en pantalla.

---

## 4. Adaptación de la UI (todo lo que depende de la nueva forma)

Una vez reformateado el mock, hay que ajustar cada componente que lo consume. Orden lógico de trabajo (de "origen" a "pantalla").

### 4.1 `src/lib/mock-products.ts`
- Reescribir las interfaces y los 7 productos a la forma de la sección 3.
- Renombrar `varianteId` → `id` en variantes; agregar `descripcion`, `destacado`, `activo`, `createdAt`; mover `precio`/`precioTransferencia`/`stock`/`imagenes` a cada variante; quitar `cuotas`, `badge`, y los duplicados a nivel producto.
- Crear un **helper de cuotas** (`calcularCuotas(precio, config)`) y un **helper de badge** (`calcularBadge(precio, precioTransferencia, createdAt)`).

### 4.2 `src/components/catalog/catalog-filters.tsx` (filtro del catálogo)
- Hoy lee `p.linea`, `p.material`, `p.tipo` desde el mock plano.
- Con la nueva forma:
  - **Líneas:** derivar de `p.linea.nombre` (o de un listado de líneas).
  - **Tipos:** derivar de `p.linea.tipo.nombre`.
  - **Material:** hoy está a nivel producto; en la BD está por **variante**. Decidir cómo se filtra material a nivel producto (ej. unir los materiales de todas sus variantes: `new Set(p.variantes.map(v => v.material))`).

### 4.3 `src/components/catalog/product-card.tsx` (tarjeta)
- `producto.imagen` → `producto.variantes[0].imagenes[0].url`.
- `producto.badge` → **calcular** con `calcularBadge(...)`.
- `producto.cuotas` → **helper de cuotas**.
- Color/material/precio para el carrito → de `producto.variantes[0]`.

### 4.4 `src/components/product/product-info.tsx` (detalle/PDP)
- `producto.linea · producto.tipo` → de la jerarquía `producto.linea.nombre` / `producto.linea.tipo.nombre`.
- `producto.badge` → calcular.
- `producto.cuotas` → helper de cuotas.
- `producto.dimensiones`, `producto.garantia` → **OK** (ya en producto).
- Selector de variantes: ya usa `producto.variantes` → actualizar nombres de campos (`varianteId` → `id`) y tomar `precio` de la **variante activa** (`variante.precio`), no del producto.

### 4.5 `src/components/home/featured-products.tsx` (home, destacados)
- Usa `MOCK_PRODUCTOS` + `ProductCard` → se adapta solo al cambiar la card.
- Verificar que tome los productos con `producto.destacado === true`.

### 4.6 `src/components/home/collections.tsx` (home, colecciones)
- Hoy usa una **constante `COLLECTIONS`** hardcodeada (`name`, `href`).
- Para imitar la BD, debería poder **derivar de las líneas del mock/BD**: por cada línea, `nombre` + `imagenUrl` (B1) + su `tipo`. En vez de la constante fija.

### 4.7 `src/app/producto/[slug]/page.tsx`
- `generateStaticParams` usa `producto.slug` → **OK** (no cambia).
- Pasa `producto.imagen`/`nombre` a la galería → adoptar imagen de la variante destacada (`producto.variantes[0].imagenes[0].url`).

### 4.8 `src/app/catalogo/page.tsx`
- Filtra `MOCK_PRODUCTOS` → depende del nuevo acceso a `linea`/`tipo` (se ajusta junto a `catalog-filters`).

---

## 5. Checklist de trabajo (en orden)

- [ ] **Mocks:** reescribir `mock-products.ts` (interfaces + 7 productos) a la forma de la sección 3 (renombrar `varianteId`→`id`, mover `precio`/`stock`/`imagenes` a variante, agregar `descripcion`/`destacado`/`activo`/`createdAt`, quitar `cuotas`/`badge` y duplicados).
- [ ] **Mocks:** agregar `MOCK_CONFIG` (cuotas global) y helper `calcularCuotas`.
- [ ] **Mocks:** helper `calcularBadge` (descuento y "NUEVO").
- [ ] **Tarjeta:** `product-card.tsx` → imagen de variante destacada, badge y cuotas calculados.
- [ ] **Detalle:** `product-info.tsx` → jerarquía línea/tipo, badge/cuotas, precio desde variante activa, renombramiento `varianteId`→`id`.
- [ ] **Filtro:** `catalog-filters.tsx` + `catalogo/page.tsx` → líneas/tipos/matériales desde la nueva forma.
- [ ] **Home:** `collections.tsx` → derivar líneas (con `imagenUrl` y `tipo`) en vez de constante fija.
- [ ] **Home:** `featured-products.tsx` → usar `destacado`.
- [ ] **PDP:** `producto/[slug]/page.tsx` → imagen de variante destacada.

---

## 6. Qué es deuda que arrastramos (para no olvidar)

- **Reestructurar los 7 productos del mock:** pasar cada `MockProducto` plano a la nueva forma implica reordenar los datos de los 7 ejemplos (mover los precios de la "primera variante" a `variantes[].precio`, crear `imagenes[]`, llenar `stock`, `createdAt`, `descripcion`, `destacado`).
- B5 (tarifas de envío) **requiere decisión** (tabla propia vs API) → el calculador de `product-info.tsx` usa una tabla hardcodeada; se resuelve en la fase de integración de envíos.

---

## 7. Documentos y archivos relacionados

- `prisma/schema.prisma` — el modelo real (la "forma" a imitar).
- `documentacion/schema-vs-ui.md` — el "por qué" y las decisiones (B1, B2, B3, B4, B5).
- `src/lib/mock-products.ts` — los datos a reformatear.
- `documentacion/workFlow.md` — roadmap por fases.
