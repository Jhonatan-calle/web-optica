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
  const [busqueda, setBusqueda] = useState("");

  const productos = useMemo(() => {
    let lista = MOCK_PRODUCTOS;

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(termino),
      );
    }

    if (filtros.linea !== TODAS) {
      lista = lista.filter((p) => p.linea.nombre === filtros.linea);
    }
    if (filtros.material !== TODAS) {
      lista = lista.filter((p) =>
        p.variantes.some((v) => v.material === filtros.material),
      );
    }
    if (filtros.tipo !== TODAS) {
      lista = lista.filter((p) => p.linea.tipo.nombre === filtros.tipo);
    }

    if (filtros.orden === "precio-asc") {
      lista = [...lista].sort((a, b) => a.variantes[0].precio - b.variantes[0].precio);
    } else if (filtros.orden === "precio-desc") {
      lista = [...lista].sort((a, b) => b.variantes[0].precio - a.variantes[0].precio);
    }

    return lista;
  }, [filtros, busqueda]);

  const hayTerminoBusqueda = busqueda.trim() !== "";

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

      <CatalogFilters
        filtros={filtros}
        onChange={setFiltros}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      {productos.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
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
              className="mt-2"
              onClick={() => {
                setFiltros(FILTROS_INICIALES);
                setBusqueda("");
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
