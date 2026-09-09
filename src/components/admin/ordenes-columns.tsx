import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown, ExternalLink, ShoppingBag } from "lucide-react";

import type { EstadoOrden, MetodoEnvio, MetodoPago } from "@/generated/prisma/enums";
import {
  CLASES_COLOR_ESTADO,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ENVIO,
  ETIQUETAS_PAGO,
} from "@/lib/orden-utils";
import { formatearPesos } from "@/lib/format-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OrdenRow {
  id: string;
  numero: number;
  fecha: Date;
  fechaLegible: string;
  nombre: string | null;
  email: string;
  cantidadItems: number;
  total: number;
  metodoPago: MetodoPago;
  metodoEnvio: MetodoEnvio;
  estado: EstadoOrden;
  alertaStock: boolean;
}

/** Encabezado con control de ordenamiento (sorting). */
function SortableHeader({
  children,
  sorted,
  onClick,
}: {
  children: React.ReactNode;
  sorted: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="-ml-2 h-7 px-2">
      {children}
      <ArrowUpDown className={cn("size-3.5", sorted && "text-brand")} aria-hidden="true" />
    </Button>
  );
}

export const columnas: ColumnDef<OrdenRow>[] = [
  {
    accessorKey: "numero",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pedido
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">#{row.original.numero}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums">
        {row.original.fechaLegible}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "nombre",
    header: "Cliente",
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{o.nombre ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{o.email}</p>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "cantidadItems",
    header: "Ítems",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.cantidadItems > 0
          ? `${row.original.cantidadItems} ${row.original.cantidadItems === 1 ? "ítem" : "ítems"}`
          : "—"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatearPesos(row.original.total)}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "metodoPago",
    header: "Pago",
    cell: ({ row }) => (
      <Badge variant="secondary" className="whitespace-nowrap">
        {ETIQUETAS_PAGO[row.original.metodoPago]}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "metodoEnvio",
    header: "Envío",
    cell: ({ row }) => (
      <Badge variant="outline" className="whitespace-nowrap">
        {ETIQUETAS_ENVIO[row.original.metodoEnvio]}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <Badge
          variant="outline"
          className={cn(
            "whitespace-nowrap border-transparent",
            CLASES_COLOR_ESTADO[row.original.estado],
          )}
        >
          {ETIQUETAS_ESTADO[row.original.estado]}
        </Badge>
        {row.original.alertaStock && (
          <Badge
            variant="outline"
            className="whitespace-nowrap border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400"
            title="Faltó stock para completar este pedido"
          >
            Sin stock
          </Badge>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "acciones",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          title="Ver detalle del pedido"
          aria-label="Ver detalle del pedido"
          render={<Link href={`/admin/ordenes/${row.original.id}`} />}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];

/** Ícono reutilizado por la tabla y el empty state. */
export const IconoOrdenes = ShoppingBag;