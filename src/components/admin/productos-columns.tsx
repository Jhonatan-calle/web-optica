import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  ArrowUpDown,
  Loader2,
  Package,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  eliminarProducto,
  toggleEstadoProducto,
} from "@/app/admin/(panel)/productos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatearPesos } from "@/lib/format-utils";

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
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          title="Editar producto"
          aria-label="Editar producto"
          render={<Link href={`/admin/productos/editar/${row.original.id}`} />}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        <ToggleEstadoButton producto={row.original} />
        <EliminarProductoButton producto={row.original} />
      </div>
    ),
    enableSorting: false,
  },
];

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
          const resultado = await toggleEstadoProducto(producto.id);
          if (resultado.ok) {
            toast.success(
              resultado.activo
                ? "Producto activado"
                : "Producto pausado",
            );
          } else {
            toast.error("No se pudo actualizar el producto", {
              description: resultado.error,
            });
          }
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

function EliminarProductoButton({ producto }: { producto: ProductoRow }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");
  const [pendiente, startTransition] = useTransition();

  const confirmado = confirmacion.trim() === producto.nombre;

  const confirmarEliminacion = () => {
    if (!confirmado) return;
    startTransition(async () => {
      const resultado = await eliminarProducto(producto.id);
      if (!resultado.ok) {
        toast.error("No se pudo eliminar el producto", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Producto eliminado", {
        description: "El producto y sus imágenes se eliminaron.",
      });
      setAbierto(false);
      setConfirmacion("");
      router.refresh();
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Eliminar producto"
            aria-label="Eliminar producto"
          />
        }
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará permanentemente &quot;{producto.nombre}&quot; junto con
            todas sus imágenes del catálogo y del almacenamiento. Esta acción no
            se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 px-1">
          <Label htmlFor="confirmar-eliminacion" className="text-sm font-medium">
            Escribí el nombre del producto para confirmar
          </Label>
          <Input
            id="confirmar-eliminacion"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder={producto.nombre}
            disabled={pendiente}
            aria-invalid={confirmacion !== "" && !confirmado}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pendiente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!confirmado || pendiente}
            onClick={confirmarEliminacion}
          >
            {pendiente && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
