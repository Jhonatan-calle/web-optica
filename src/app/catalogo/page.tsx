"use client";

import { useMemo, useState } from "react";

import { CatalogFilters, type Filtros } from "@/components/catalog/catalog-filters";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { MOCK_PRODUCTOS } from "@/lib/mock-products";

const TODAS = "Todas";

const FILTROS_INICIALES: Filtros = {
  linea: TODAS,
  material: TODAS,
  tipo: TODAS,
  orden: "relevancia",
};

export default function CatalogoPage() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const productos = useMemo(() => {
    let lista = MOCK_PRODUCTOS;

    if (filtros.linea !== TODAS) {
      lista = lista.filter((p) => p.linea === filtros.linea);
    }
    if (filtros.material !== TODAS) {
      lista = lista.filter((p) => p.material === filtros.material);
    }
    if (filtros.tipo !== TODAS) {
      lista = lista.filter((p) => p.tipo === filtros.tipo);
    }

    if (filtros.orden === "precio-asc") {
      lista = [...lista].sort((a, b) => a.precio - b.precio);
    } else if (filtros.orden === "precio-desc") {
      lista = [...lista].sort((a, b) => b.precio - a.precio);
    }

    return lista;
  }, [filtros]);

  const hayFiltrosActivos =
    filtros.linea !== TODAS ||
    filtros.material !== TODAS ||
    filtros.tipo !== TODAS;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
        Catálogo
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nuestras líneas de anteojos y accesorios.
      </p>

      <CatalogFilters filtros={filtros} onChange={setFiltros} />

      {productos.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {productos.map((producto) => (
            <ProductCard key={producto.varianteId} producto={producto} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">
            No encontramos productos con esos filtros.
          </p>
          <p className="text-sm text-muted-foreground">
            Probá ajustando o limpiando los filtros.
          </p>
          {hayFiltrosActivos && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setFiltros(FILTROS_INICIALES)}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
