"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { PackageSearch, Search } from "lucide-react";

import { ProductoRow, columnas } from "@/components/admin/productos-columns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface LineaFiltro {
  id: string;
  nombre: string;
}

export interface ProductosSearchParams {
  q?: string;
  linea?: string;
  estado?: string;
}

interface ProductosTableProps {
  data: ProductoRow[];
  lineas: LineaFiltro[];
  searchParams: ProductosSearchParams;
}

/**
 * Tabla de productos del panel admin (TanStack Table).
 *
 * Filtrado híbrido: la data llega ya filtrada desde el Server Component
 * (según los searchParams de la URL). Aquí solo se renderiza la tabla, se
 * maneja el ordenamiento client-side y se sincronizan los controles de filtro
 * con la URL (router.push) para disparar el re-render del servidor.
 */
export function ProductosTable({
  data,
  lineas,
  searchParams,
}: ProductosTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [q, setQ] = React.useState(searchParams.q ?? "");
  const qBusqueda = React.useRef(q);

  const table = useReactTable({
    data,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  const actualizarParams = React.useCallback(
    (patch: Partial<ProductosSearchParams>) => {
      const params = new URLSearchParams();

      const qNuevo = patch.q !== undefined ? patch.q : searchParams.q;
      const lineaNuevo = patch.linea !== undefined ? patch.linea : searchParams.linea;
      const estadoNuevo =
        patch.estado !== undefined ? patch.estado : searchParams.estado;

      if (qNuevo) params.set("q", qNuevo);
      if (lineaNuevo) params.set("linea", lineaNuevo);
      if (estadoNuevo) params.set("estado", estadoNuevo);

      const qs = params.toString();
      router.push(`/admin/productos${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  // Debounce del buscador: actualiza la URL 300ms después de dejar de escribir.
  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (q === qBusqueda.current) return;
      qBusqueda.current = q;
      actualizarParams({ q });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [q, actualizarParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o slug…"
            className="pl-8"
            aria-label="Buscar productos"
          />
        </div>

        <Select
          value={searchParams.linea ?? ""}
          onValueChange={(valor) => {
            actualizarParams({ linea: valor === "todas" ? "" : (valor ?? "") });
          }}
        >
          <SelectTrigger aria-label="Filtrar por línea">
            <SelectValue placeholder="Todas las líneas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las líneas</SelectItem>
            {lineas.map((linea) => (
              <SelectItem key={linea.id} value={linea.id}>
                {linea.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.estado ?? ""}
          onValueChange={(valor) => {
            actualizarParams({ estado: valor === "todos" ? "" : (valor ?? "") });
          }}
        >
          <SelectTrigger aria-label="Filtrar por estado">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="pausado">Pausados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnas.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <PackageSearch
                      className="size-8 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    No se encontraron productos con los filtros seleccionados.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {data.length} producto{data.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}

