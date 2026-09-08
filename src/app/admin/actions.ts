"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { EstadoOrden } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

/**
 * Métricas del dashboard admin. Todos los cálculos de "día" y "mes" usan la
 * zona horaria de Argentina (UTC−3, sin horario de verano), que es donde opera
 * la tienda; el servidor (Vercel) corre en UTC.
 */
const TZ_ARGENTINA = "America/Argentina/Buenos_Aires";

/** Umbral de stock para considerarlo bajo (variante). */
const STOCK_BAJO_MAX = 5;

/** Estados que se consideran una venta efectiva (fuera PENDIENTE/CANCELADO). */
const ESTADOS_VENTA = [
  EstadoOrden.PAGADO,
  EstadoOrden.EN_PREPARACION,
  EstadoOrden.DESPACHADO,
  EstadoOrden.LISTO_PARA_RETIRAR,
  EstadoOrden.ENTREGADO,
];

/** Estados que esperan despacho: pagada y en preparación. */
const ESTADOS_PENDIENTES_DESPACHO = [EstadoOrden.PAGADO, EstadoOrden.EN_PREPARACION];

export interface VarianteStockCritico {
  id: string;
  color: string | null;
  sku: string | null;
  stock: number;
  producto: { nombre: string; slug: string };
  imagenUrl: string | null;
}

export interface MetricasDashboard {
  ventasMes: number;
  ventasMesFormateado: string;
  pendientesDespacho: number;
  ordenesHoy: number;
  stockCritico: number;
  stockBajo: VarianteStockCritico[];
}

/** Inicio del día actual en hora de Argentina (Argentina usa UTC−3, sin DST). */
function inicioDiaArgentina(): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_ARGENTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

  return new Date(`${partes.year}-${partes.month}-${partes.day}T00:00:00-03:00`);
}

/** Inicio del mes actual en hora de Argentina. */
function inicioMesArgentina(): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_ARGENTINA,
    year: "numeric",
    month: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

  return new Date(`${partes.year}-${partes.month}-01T00:00:00-03:00`);
}

function formatearPesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

/**
 * Devuelve las métricas del dashboard:
 * - ventas totales del mes actual (órdenes efectivizadas)
 * - pedidos pendientes de despacho
 * - ordenes creadas hoy
 * - variantes con stock crítico/bajo (≤ 5)
 *
 * Solo accesible por usuarios con rol ADMIN. Las 4 queries corren en paralelo.
 */
export async function obtenerMetricasDashboard(): Promise<MetricasDashboard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const [ventasMes, pendientesDespacho, ordenesHoy, stockBajo] =
    await Promise.all([
      prisma.orden.aggregate({
        where: {
          estado: { in: ESTADOS_VENTA },
          createdAt: { gte: inicioMesArgentina() },
        },
        _sum: { total: true },
      }),
      prisma.orden.count({
        where: { estado: { in: ESTADOS_PENDIENTES_DESPACHO } },
      }),
      prisma.orden.count({
        where: { createdAt: { gte: inicioDiaArgentina() } },
      }),
      prisma.variante.findMany({
        where: { stock: { lte: STOCK_BAJO_MAX } },
        select: {
          id: true,
          color: true,
          sku: true,
          stock: true,
          producto: { select: { nombre: true, slug: true } },
          imagenes: {
            select: { url: true },
            orderBy: { orden: "asc" },
            take: 1,
          },
        },
        orderBy: { stock: "asc" },
      }),
    ]);

  const totalVentas = Number(ventasMes._sum.total ?? 0);

  return {
    ventasMes: totalVentas,
    ventasMesFormateado: formatearPesos(totalVentas),
    pendientesDespacho,
    ordenesHoy,
    stockCritico: stockBajo.length,
    stockBajo: stockBajo.map((v) => ({
      id: v.id,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      producto: v.producto,
      imagenUrl: v.imagenes[0]?.url ?? null,
    })),
  };
}

/** Cierra la sesión de Supabase y vuelve a la home de la tienda. */
export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}