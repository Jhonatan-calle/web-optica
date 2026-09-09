import Link from "next/link";
import { Suspense } from "react";

import {
  CatalogoGridSkeleton,
  FiltrosSkeleton,
} from "@/components/catalog/catalogo-skeleton";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { ProductCard } from "@/components/catalog/product-card";
import {
  obtenerCatalogoPublico,
  obtenerOpcionesFiltros,
  type OpcionesFiltros,
} from "@/lib/catalog-utils";
import type { ProductoPublico } from "@/lib/catalog-types";
import { obtenerConfigGlobal } from "@/lib/config-utils";
import type { ConfigCuotas } from "@/lib/product-utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface CatalogoParams {
  q?: string;
  linea?: string;
  material?: string;
  tipo?: string;
  orden?: string;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogoParams>;
}) {
  const params = await searchParams;

  const clave = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => typeof v === "string" && v.length > 0)
      .map(([k, v]) => [k, v as string]),
  ).toString();

  const opciones: OpcionesFiltros = await obtenerOpcionesFiltros();
  const config = await obtenerConfigGlobal();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
        Catálogo
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nuestras líneas de anteojos y accesorios.
      </p>

      <Suspense fallback={<FiltrosSkeleton />}>
        <CatalogFilters opciones={opciones} />
      </Suspense>

      <Suspense key={clave} fallback={<CatalogoGridSkeleton />}>
        <Resultados
          params={params}
          configCuotas={config.cuotas}
          diasNuevo={config.diasNuevo}
        />
      </Suspense>
    </main>
  );
}

async function Resultados({
  params,
  configCuotas,
  diasNuevo,
}: {
  params: CatalogoParams;
  configCuotas: ConfigCuotas;
  diasNuevo: number;
}) {
  let productos: ProductoPublico[];
  try {
    productos = await obtenerCatalogoPublico(params);
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-foreground">
          No pudimos cargar los productos.
        </p>
        <p className="text-sm text-muted-foreground">
          Intentá de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const hayTerminoBusqueda = Boolean(params.q?.trim());
  const hayFiltrosActivos = Boolean(
    params.linea || params.material || params.tipo,
  );

  if (productos.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-foreground">
          {hayTerminoBusqueda
            ? "No encontramos productos que coincidan con tu búsqueda"
            : "No encontramos productos con esos filtros."}
        </p>
        <p className="text-sm text-muted-foreground">
          {hayTerminoBusqueda
            ? "Probá con otro término o limpiá los filtros."
            : "Probá ajustando o limpiando los filtros."}
        </p>
        {(hayFiltrosActivos || hayTerminoBusqueda) && (
          <Button
            variant="outline"
            render={<Link href="/catalogo" />}
            nativeButton={false}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          configCuotas={configCuotas}
          diasNuevo={diasNuevo}
        />
      ))}
    </div>
  );
}