import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProductoRow {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  destacado: boolean;
  imagenUrl: string | null;
  lineaId: string;
  lineaNombre: string;
  precio: number;
  stock: number;
  createdAt: Date;
}

const STOCK_CRITICO_MAX = 5;

function formatearPesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

/** Encabezado con control de ordenamiento (sorting) para columnas numéricas/nombre. */
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

export const columnas: ColumnDef<ProductoRow>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Producto
      </SortableHeader>
    ),
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3">
          {p.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imagenUrl}
              alt=""
              className="size-10 shrink-0 rounded-md object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Package className="size-4" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{p.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "lineaNombre",
    header: "Línea",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.lineaNombre}</Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "precio",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Precio
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatearPesos(row.original.precio)}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <SortableHeader
        sorted={column.getIsSorted() !== false}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stock
      </SortableHeader>
    ),
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <span
          className={cn(
            "tabular-nums",
            stock === 0
              ? "text-destructive"
              : stock <= STOCK_CRITICO_MAX
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground",
          )}
        >
          {stock} u.
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => {
      const activo = row.original.activo;
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-transparent",
            activo
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          )}
        >
          {activo ? "Activo" : "Pausado"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "acciones",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ToggleEstadoButton producto={row.original} />
      </div>
    ),
    enableSorting: false,
  },
];

import { Package, Pause, Play } from "lucide-react";
import { useTransition } from "react";
import { toggleEstadoProducto } from "@/app/admin/(panel)/productos/actions";

function ToggleEstadoButton({ producto }: { producto: ProductoRow }) {
  const [pendiente, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={producto.activo ? "Pausar producto" : "Activar producto"}
      aria-label={producto.activo ? "Pausar producto" : "Activar producto"}
      disabled={pendiente}
      onClick={() => {
        startTransition(async () => {
          await toggleEstadoProducto(producto.id);
        });
      }}
    >
      {producto.activo ? (
        <Pause className="size-4" aria-hidden="true" />
      ) : (
        <Play className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
