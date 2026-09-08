import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";

import type { VarianteStockCritico } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STOCK_CRITICO_MAX = 2;

interface StockCriticoProps {
  items: VarianteStockCritico[];
}

/**
 * Lista de variantes con stock bajo (≤ 5). Server Component de solo lectura:
 * no expone acciones de edición, solo el estado actual del inventario.
 */
export function StockCritico({ items }: StockCriticoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock crítico / bajo</CardTitle>
        <CardDescription>
          Variantes con stock menor o igual a 5 unidades.
        </CardDescription>
      </CardHeader>

      {items.length === 0 ? (
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-6 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            Todo en orden: no hay variantes con stock bajo.
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <ul className="divide-y divide-border">
            {items.map((v) => {
              const critico = v.stock <= STOCK_CRITICO_MAX;
              return (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {v.imagenUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.imagenUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-md object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Package className="size-4" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        href={`/producto/${v.producto.slug}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {v.producto.nombre}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.color ? `${v.color} · ` : ""}
                        {v.sku ?? "sin SKU"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {v.stock} u.
                    </span>
                    <Badge
                      variant={critico ? "destructive" : "outline"}
                      className={cn(
                        !critico &&
                          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {critico ? "Crítico" : "Bajo"}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}