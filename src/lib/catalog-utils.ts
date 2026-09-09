import "server-only";

import { Prisma } from "@/generated/prisma/client";

import type {
  ImagenPublica,
  LineaPublica,
  ProductoPublico,
  TipoPublico,
  VariantePublica,
} from "@/lib/catalog-types";
import { prisma } from "@/lib/prisma";

export interface FiltrosCatalogo {
  q?: string;
  linea?: string;
  material?: string;
  tipo?: string;
  orden?: string;
}

export interface OpcionesFiltros {
  lineas: string[];
  materiales: string[];
  tipos: string[];
}

export interface Coleccion {
  id: string;
  nombre: string;
  tipo: string;
  imagenUrl: string;
}

const SELECT_PRODUCTO_PUBLICO = {
  id: true,
  slug: true,
  nombre: true,
  descripcion: true,
  dimensiones: true,
  garantia: true,
  destacado: true,
  activo: true,
  createdAt: true,
  linea: {
    select: {
      id: true,
      nombre: true,
      imagenUrl: true,
      tipo: { select: { nombre: true } },
    },
  },
  variantes: {
    select: {
      id: true,
      color: true,
      material: true,
      precio: true,
      precioTransferencia: true,
      stock: true,
      imagenes: {
        select: { url: true, alt: true, orden: true },
        orderBy: { orden: "asc" },
      },
    },
  },
} satisfies Prisma.ProductoSelect;

type ProductoConLinea = Prisma.ProductoGetPayload<{
  select: typeof SELECT_PRODUCTO_PUBLICO;
}>;

function mapearImagenes(
  imagenes: ProductoConLinea["variantes"][number]["imagenes"],
): ImagenPublica[] {
  return imagenes.map((imagen) => ({
    url: imagen.url,
    alt: imagen.alt ?? undefined,
  }));
}

function mapearVariante(
  variante: ProductoConLinea["variantes"][number],
): VariantePublica {
  return {
    id: variante.id,
    color: variante.color ?? "",
    material: variante.material ?? "",
    precio: Number(variante.precio),
    precioTransferencia:
      variante.precioTransferencia === null
        ? undefined
        : Number(variante.precioTransferencia),
    stock: variante.stock,
    imagenes: mapearImagenes(variante.imagenes),
  };
}

function mapearProductoPublico(producto: ProductoConLinea): ProductoPublico {
  const linea: LineaPublica = {
    id: producto.linea.id,
    nombre: producto.linea.nombre,
    imagenUrl: producto.linea.imagenUrl ?? undefined,
    tipo: { nombre: producto.linea.tipo.nombre } satisfies TipoPublico,
  };

  return {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? undefined,
    linea,
    dimensiones: producto.dimensiones ?? "",
    garantia: producto.garantia ?? "",
    createdAt: producto.createdAt.toISOString(),
    destacado: producto.destacado,
    activo: producto.activo,
    variantes: producto.variantes.map(mapearVariante),
  };
}

/**
 * Lista los productos activos de la tienda con sus variantes e imágenes.
 *
 * Los filtros (búsqueda, línea, material, tipo) y el ordenamiento se aplican en
 * el servidor con la misma lógica que usaba la UI con mocks.
 */
export async function obtenerCatalogoPublico(
  filtros: FiltrosCatalogo = {},
): Promise<ProductoPublico[]> {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: SELECT_PRODUCTO_PUBLICO,
      orderBy: { createdAt: "desc" },
    });

    let lista = productos
      .filter((p) => p.variantes.length > 0)
      .map(mapearProductoPublico);

    const termino = filtros.q?.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(termino));
    }

    if (filtros.linea) {
      lista = lista.filter((p) => p.linea.nombre === filtros.linea);
    }
    if (filtros.material) {
      lista = lista.filter((p) =>
        p.variantes.some((v) => v.material === filtros.material),
      );
    }
    if (filtros.tipo) {
      lista = lista.filter((p) => p.linea.tipo.nombre === filtros.tipo);
    }

    if (filtros.orden === "precio-asc") {
      lista = [...lista].sort(
        (a, b) => (a.variantes[0]?.precio ?? 0) - (b.variantes[0]?.precio ?? 0),
      );
    } else if (filtros.orden === "precio-desc") {
      lista = [...lista].sort(
        (a, b) => (b.variantes[0]?.precio ?? 0) - (a.variantes[0]?.precio ?? 0),
      );
    }

    return lista;
  } catch (error) {
    console.error("Error al obtener el catálogo público:", error);
    throw new Error("catálogo no disponible");
  }
}

/**
 * Busca un producto activo por su slug para el detalle (PDP).
 * Devuelve `null` si no existe, está inactivo o no tiene variantes.
 */
export async function obtenerProductoPublicoPorSlug(
  slug: string,
): Promise<ProductoPublico | null> {
  try {
    const producto = await prisma.producto.findFirst({
      where: { slug, activo: true },
      select: SELECT_PRODUCTO_PUBLICO,
    });

    if (!producto || producto.variantes.length === 0) {
      return null;
    }

    return mapearProductoPublico(producto);
  } catch (error) {
    console.error("Error al obtener el producto público:", error);
    throw new Error("producto no disponible");
  }
}

/**
 * Devuelve las opciones de filtro (líneas, materiales y tipos) derivadas de los
 * productos activos, para alimentar los chips del catálogo.
 */
export async function obtenerOpcionesFiltros(): Promise<OpcionesFiltros> {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: {
        linea: { select: { nombre: true, tipo: { select: { nombre: true } } } },
        variantes: { select: { material: true } },
      },
    });

    return {
      lineas: [...new Set(productos.map((p) => p.linea.nombre))],
      materiales: [
        ...new Set(productos.flatMap((p) => p.variantes.map((v) => v.material))),
      ].filter(Boolean) as string[],
      tipos: [...new Set(productos.map((p) => p.linea.tipo.nombre))],
    };
  } catch (error) {
    console.error("Error al obtener las opciones de filtro:", error);
    return { lineas: [], materiales: [], tipos: [] };
  }
}

/**
 * Productos destacados para la Home (destacado = true y activos).
 */
export async function obtenerDestacados(): Promise<ProductoPublico[]> {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true, destacado: true },
      select: SELECT_PRODUCTO_PUBLICO,
      orderBy: { createdAt: "desc" },
    });

    return productos
      .filter((p) => p.variantes.length > 0)
      .map(mapearProductoPublico);
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    throw new Error("destacados no disponibles");
  }
}

/**
 * Colecciones (líneas con al menos un producto activo) para la Home.
 */
export async function obtenerColecciones(): Promise<Coleccion[]> {
  try {
    const lineas = await prisma.linea.findMany({
      where: { productos: { some: { activo: true } } },
      select: {
        id: true,
        nombre: true,
        imagenUrl: true,
        tipo: { select: { nombre: true } },
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    return lineas.map((linea) => ({
      id: linea.id,
      nombre: linea.nombre,
      tipo: linea.tipo.nombre,
      imagenUrl: linea.imagenUrl ?? "/isologo.svg",
    }));
  } catch (error) {
    console.error("Error al obtener las colecciones:", error);
    throw new Error("colecciones no disponibles");
  }
}