"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { MOCK_PRODUCTOS } from "@/lib/mock-products";

export type Filtros = {
  linea: string;
  material: string;
  tipo: string;
  orden: string;
};

const TODAS = "Todas";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-[#00848C] bg-[#00848C] text-white"
          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function CatalogFilters({
  filtros,
  onChange,
}: {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
}) {
  const opciones = useMemo(
    () => ({
      lineas: [...new Set(MOCK_PRODUCTOS.map((p) => p.linea.nombre))],
      materiales: [
        ...new Set(
          MOCK_PRODUCTOS.flatMap((p) => p.variantes.map((v) => v.material)),
        ),
      ].filter(Boolean) as string[],
      tipos: [...new Set(MOCK_PRODUCTOS.map((p) => p.linea.tipo.nombre))],
    }),
    []
  );

  const set = (campo: keyof Filtros, valor: string) => {
    if (campo === "orden") {
      onChange({ ...filtros, orden: valor });
      return;
    }
    onChange({ ...filtros, [campo]: valor === TODAS ? TODAS : valor });
  };

  const isActive = (campo: keyof Filtros, valor: string) =>
    filtros[campo] === valor;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Línea
          </span>
          <Chip active={isActive("linea", TODAS)} onClick={() => set("linea", TODAS)}>
            {TODAS}
          </Chip>
          {opciones.lineas.map((linea) => (
            <Chip
              key={linea}
              active={isActive("linea", linea)}
              onClick={() => set("linea", linea)}
            >
              {linea}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Material
          </span>
          <Chip
            active={isActive("material", TODAS)}
            onClick={() => set("material", TODAS)}
          >
            {TODAS}
          </Chip>
          {opciones.materiales.map((material) => (
            <Chip
              key={material}
              active={isActive("material", material)}
              onClick={() => set("material", material)}
            >
              {material}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Tipo
          </span>
          <Chip active={isActive("tipo", TODAS)} onClick={() => set("tipo", TODAS)}>
            {TODAS}
          </Chip>
          {opciones.tipos.map((tipo) => (
            <Chip
              key={tipo}
              active={isActive("tipo", tipo)}
              onClick={() => set("tipo", tipo)}
            >
              {tipo}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Ordenar
        </span>
        <select
          value={filtros.orden}
          onChange={(e) => set("orden", e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="relevancia">Relevancia</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>
    </div>
  );
}
