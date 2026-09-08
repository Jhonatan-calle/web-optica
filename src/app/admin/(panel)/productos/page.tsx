import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ProductoRow } from "@/components/admin/productos-columns";
import {
  ProductosTable,
  type LineaFiltro,
} from "@/components/admin/productos-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos | Panel La Óptica",
};

interface ProductosPageProps {
  searchParams: Promise<{
    q?: string;
    linea?: string;
    estado?: string;
  }>;
}

const ESTADO_FILTRO: Record<string, boolean | undefined> = {
  activo: true,
  pausado: false,
  default: undefined,
};

/**
 * Listado de productos del panel admin.
 *
 * Filtrado híbrido: este Server Component lee los searchParams de la URL,
 * ejecuta las queries de Prisma con esos filtros (buscador, línea y estado)
 * y le pasa la data ya filtrada a la tabla (TanStack Table) en el cliente.
 */
export default async function AdminProductosPage({
  searchParams,
}: ProductosPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestioná el catálogo: buscá, filtrá y pausá productos.
          </p>
        </div>
        <Button
          render={<Link href="/admin/productos/nuevo" />}
          nativeButton={false}
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo producto
        </Button>
      </header>

      <Suspense fallback={<ProductosTableSkeleton />}>
        <ProductosSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProductosSection({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    linea?: string;
    estado?: string;
  }>;
}) {
  const params = await searchParams;

  const { q, linea, estado } = params;

  const where: Record<string, unknown> = {};

  if (q?.trim()) {
    const busqueda = q.trim();
    where.OR = [
      { nombre: { contains: busqueda, mode: "insensitive" } },
      { slug: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  if (linea) {
    where.lineaId = linea;
  }

  const estadoActivo = ESTADO_FILTRO[estado ?? "default"];
  if (estadoActivo !== undefined) {
    where.activo = estadoActivo;
  }

  const [productos, lineas] = await Promise.all([
    prisma.producto.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        slug: true,
        activo: true,
        destacado: true,
        createdAt: true,
        linea: { select: { id: true, nombre: true } },
        variantes: {
          select: {
            precio: true,
            stock: true,
            imagenes: {
              select: { url: true },
              orderBy: { orden: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.linea.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const filas: ProductoRow[] = productos.map((p) => {
    const primeraVariante = p.variantes[0];
    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      activo: p.activo,
      destacado: p.destacado,
      imagenUrl: primeraVariante?.imagenes[0]?.url ?? null,
      lineaId: p.linea.id,
      lineaNombre: p.linea.nombre,
      precio: Number(primeraVariante?.precio ?? 0),
      stock: p.variantes.reduce((acc, v) => acc + v.stock, 0),
      createdAt: p.createdAt,
    };
  });

  const filtrosLinea: LineaFiltro[] = lineas.map((l) => ({
    id: l.id,
    nombre: l.nombre,
  }));

  return (
    <ProductosTable
      data={filas}
      lineas={filtrosLinea}
      searchParams={{ q, linea, estado }}
    />
  );
}

function ProductosTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-2 py-3 last:border-0"
          >
            <Skeleton className="size-10 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
