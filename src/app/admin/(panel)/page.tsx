import type { Metadata } from "next";
import { Suspense } from "react";
import { Banknote, PackageSearch, ShoppingBag, Truck } from "lucide-react";

import { obtenerMetricasDashboard } from "../actions";
import { StatCard } from "@/components/admin/stat-card";
import { StockCritico } from "@/components/admin/stock-critico";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Dashboard | Panel La Óptica",
};

const hoy = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "full",
  timeZone: "America/Argentina/Buenos_Aires",
}).format(new Date());

/**
 * Dashboard general del panel admin. Server Component: las métricas se cargan
 * en el servidor al renderizar y se actualizan con la navegación (sin polling
 * ni refresco en el cliente).
 */
export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{hoy}</p>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <Metricas />
      </Suspense>
    </div>
  );
}

async function Metricas() {
  let metricas: Awaited<ReturnType<typeof obtenerMetricasDashboard>> | null =
    null;
  try {
    metricas = await obtenerMetricasDashboard();
  } catch (error) {
    console.error("Error al cargar métricas del dashboard:", error);
  }

  if (!metricas) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
        No se pudieron cargar las métricas. Intentá de nuevo en un momento.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Ventas del mes"
          valor={metricas.ventasMesFormateado}
          icono={Banknote}
          variante="brand"
          hint="Total de órdenes pagadas"
        />
        <StatCard
          titulo="Pendientes de despacho"
          valor={metricas.pendientesDespacho}
          icono={Truck}
          variante="warning"
          hint="Pagadas y en preparación"
        />
        <StatCard
          titulo="Órdenes del día"
          valor={metricas.ordenesHoy}
          icono={ShoppingBag}
          variante="success"
          hint="Creadas en el día de hoy"
        />
        <StatCard
          titulo="Stock bajo"
          valor={metricas.stockCritico}
          icono={PackageSearch}
          variante={metricas.stockCritico > 0 ? "danger" : "success"}
          hint="Variantes con stock ≤ 5"
        />
      </div>

      <StockCritico items={metricas.stockBajo} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  );
}