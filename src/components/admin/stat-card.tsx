import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatVariant = "brand" | "warning" | "success" | "danger";

const VARIANTES: Record<
  StatVariant,
  { icono: string; borde: string; etiqueta: string }
> = {
  brand: {
    icono: "bg-brand/10 text-brand",
    borde: "border-t-2 border-t-brand",
    etiqueta: "text-brand",
  },
  warning: {
    icono: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borde: "border-t-2 border-t-amber-500",
    etiqueta: "text-amber-600 dark:text-amber-400",
  },
  success: {
    icono: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borde: "border-t-2 border-t-emerald-500",
    etiqueta: "text-emerald-600 dark:text-emerald-400",
  },
  danger: {
    icono: "bg-destructive/10 text-destructive",
    borde: "border-t-2 border-t-destructive",
    etiqueta: "text-destructive",
  },
};

interface StatCardProps {
  titulo: string;
  valor: string | number;
  icono: LucideIcon;
  variante?: StatVariant;
  hint?: string;
}

/**
 * Card de métrica del dashboard admin. Es un Server Component de solo lectura:
 * recibe el valor ya calculado y lo muestra (ícono + cifra + hint).
 */
export function StatCard({
  titulo,
  valor,
  icono: Icono,
  variante = "brand",
  hint,
}: StatCardProps) {
  const estilo = VARIANTES[variante];

  return (
    <Card className={cn("h-full", estilo.borde)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.8rem] text-muted-foreground">{titulo}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {valor}
          </p>
          {hint ? (
            <p className={cn("text-xs", estilo.etiqueta)}>{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            estilo.icono,
          )}
        >
          <Icono className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}