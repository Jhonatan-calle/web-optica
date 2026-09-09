"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OpcionesFiltros } from "@/lib/catalog-utils";

const TODAS = "Todas";
const ORDEN_DEFAULT = "relevancia";

type CampoFiltro = "linea" | "material" | "tipo";

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

export function CatalogFilters({ opciones }: { opciones: OpcionesFiltros }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const filtros = {
    linea: searchParams.get("linea") ?? TODAS,
    material: searchParams.get("material") ?? TODAS,
    tipo: searchParams.get("tipo") ?? TODAS,
    orden: searchParams.get("orden") ?? ORDEN_DEFAULT,
  };

  const navegar = (params: URLSearchParams) => {
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/catalogo?${qs}` : "/catalogo");
    });
  };

  const set = (campo: CampoFiltro, valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === TODAS) {
      params.delete(campo);
    } else {
      params.set(campo, valor);
    }
    navegar(params);
  };

  const setOrden = (valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === ORDEN_DEFAULT) {
      params.delete("orden");
    } else {
      params.set("orden", valor);
    }
    navegar(params);
  };

  const onBusquedaChange = (valor: string) => {
    setBusqueda(valor);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor.trim()) {
        params.set("q", valor.trim());
      } else {
        params.delete("q");
      }
      navegar(params);
    }, 350);
  };

  const limpiar = () => {
    setBusqueda("");
    navegar(new URLSearchParams());
  };

  const hayFiltrosActivos =
    filtros.linea !== TODAS ||
    filtros.material !== TODAS ||
    filtros.tipo !== TODAS ||
    busqueda.trim() !== "";

  const isActive = (campo: CampoFiltro, valor: string) =>
    filtros[campo] === valor;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 transition-opacity",
        isPending && "pointer-events-none opacity-50",
      )}
      aria-busy={isPending}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar productos…"
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Ordenar
        </span>
        <select
          value={filtros.orden}
          onChange={(e) => setOrden(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="relevancia">Relevancia</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiar}
            className="text-xs font-medium text-[#00848C] hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}