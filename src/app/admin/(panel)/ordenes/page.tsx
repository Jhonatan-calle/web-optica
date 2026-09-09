import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import type { EstadoOrden } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import {
  OrdenesTable,
  type OrdenesSearchParams,
} from "@/components/admin/ordenes-table";
import { ESTADOS_ORDEN } from "@/lib/orden-utils";
import { formatearFecha } from "@/lib/format-utils";
import type { OrdenRow } from "@/components/admin/ordenes-columns";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Órdenes | Panel La Óptica",
};

interface OrdenesPageProps {
  searchParams: Promise<OrdenesSearchParams>;
}

/**
 * Listado global de pedidos del panel admin.
 *
 * Filtrado híbrido: este Server Component lee los searchParams de la URL,
 * ejecuta la query de Prisma con esos filtros (buscador y estado) y le pasa la
 * data ya ordenada (por fecha desc) a la tabla (TanStack Table) en el cliente.
 */
export default async function AdminOrdenesPage({
  searchParams,
}: OrdenesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Órdenes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos los pedidos de la tienda, ordenados por fecha. Buscá por número,
          nombre o email y filtrá por estado.
        </p>
      </header>

      <Suspense fallback={<OrdenesTableSkeleton />}>
        <OrdenesSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrdenesSection({
  searchParams,
}: {
  searchParams: Promise<OrdenesSearchParams>;
}) {
  const params = await searchParams;

  const where: Prisma.OrdenWhereInput = {};

  const estado = ESTADOS_ORDEN.includes(params.estado as EstadoOrden)
    ? (params.estado as EstadoOrden)
    : undefined;
  if (estado) {
    where.estado = estado;
  }

  const busqueda = params.q?.trim();
  if (busqueda) {
    const condiciones: Prisma.OrdenWhereInput[] = [
      { nombreContacto: { contains: busqueda, mode: "insensitive" } },
      { emailContacto: { contains: busqueda, mode: "insensitive" } },
    ];
    if (Number.isInteger(Number(busqueda))) {
      condiciones.push({ numero: Number(busqueda) });
    }
    where.OR = condiciones;
  }

  let ordenes;
  try {
    ordenes = await prisma.orden.findMany({
      where,
      select: {
        id: true,
        numero: true,
        createdAt: true,
        nombreContacto: true,
        emailContacto: true,
        total: true,
        metodoPago: true,
        metodoEnvio: true,
        estado: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("No se pudieron cargar las órdenes:", error);
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No pudimos cargar los pedidos.
        </p>
        <p className="text-sm text-muted-foreground">
          Intentá de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const filas: OrdenRow[] = ordenes.map((o) => ({
    id: o.id,
    numero: o.numero,
    fecha: o.createdAt,
    fechaLegible: formatearFecha(o.createdAt, "America/Argentina/Buenos_Aires"),
    nombre: o.nombreContacto,
    email: o.emailContacto,
    cantidadItems: o._count.items,
    total: Number(o.total),
    metodoPago: o.metodoPago,
    metodoEnvio: o.metodoEnvio,
    estado: o.estado,
  }));

  return (
    <OrdenesTable
      data={filas}
      searchParams={{ q: params.q, estado }}
    />
  );
}

function OrdenesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-2 py-3 last:border-0"
          >
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
    </div>
  );
}