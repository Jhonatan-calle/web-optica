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
import { Search } from "lucide-react";

import {
  columnas,
  IconoOrdenes,
  type OrdenRow,
} from "@/components/admin/ordenes-columns";
import { ESTADOS_ORDEN, ETIQUETAS_ESTADO } from "@/lib/orden-utils";
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

export interface OrdenesSearchParams {
  q?: string;
  estado?: string;
}

interface OrdenesTableProps {
  data: OrdenRow[];
  searchParams: OrdenesSearchParams;
}

/**
 * Tabla de pedidos del panel admin (TanStack Table).
 *
 * Filtrado híbrido: la data llega ya filtrada desde el Server Component
 * (según los searchParams de la URL). Aquí solo se renderiza la tabla, se
 * maneja el ordenamiento client-side y se sincronizan los controles de filtro
 * con la URL (router.push) para disparar el re-render del servidor.
 */
export function OrdenesTable({ data, searchParams }: OrdenesTableProps) {
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
    (patch: Partial<OrdenesSearchParams>) => {
      const params = new URLSearchParams();

      const qNuevo = patch.q !== undefined ? patch.q : searchParams.q;
      const estadoNuevo =
        patch.estado !== undefined ? patch.estado : searchParams.estado;

      if (qNuevo) params.set("q", qNuevo);
      if (estadoNuevo) params.set("estado", estadoNuevo);

      const qs = params.toString();
      router.push(`/admin/ordenes${qs ? `?${qs}` : ""}`);
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
            placeholder="Buscar por N° de pedido, nombre o email…"
            className="pl-8"
            aria-label="Buscar pedidos"
          />
        </div>

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
            {ESTADOS_ORDEN.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {ETIQUETAS_ESTADO[estado]}
              </SelectItem>
            ))}
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
                    <IconoOrdenes
                      className="size-8 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    No se encontraron pedidos con los filtros seleccionados.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {data.length} pedido{data.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}