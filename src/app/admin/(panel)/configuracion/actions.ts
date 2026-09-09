"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { configuracionSchema } from "@/lib/configuracion-schema";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";

export interface ValoresConfiguracion {
  cuotasCantidad: number;
  cuotasConInteres: boolean;
  diasProductoNuevo: number;
}

export interface ResultadoConfiguracion {
  ok: boolean;
  error?: string;
}

const CLAVES_CONFIG = [
  "cuotas_cantidad",
  "cuotas_con_interes",
  "dias_producto_nuevo",
] as const;

const DEFAULTS: ValoresConfiguracion = {
  cuotasCantidad: 3,
  cuotasConInteres: false,
  diasProductoNuevo: 21,
};

const RUTAS_PUBLICAS = ["/", "/catalogo"] as const;

async function esUsuarioAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return esAdmin(user);
}

/**
 * Devuelve los valores de configuración actuales (o los defaults si la tabla
 * está vacía). Solo accesible para administradores.
 */
export async function obtenerConfiguracionAdmin(): Promise<ValoresConfiguracion> {
  if (!(await esUsuarioAdmin())) {
    redirect("/");
  }

  const filas = await prisma.configuracion.findMany({
    where: { clave: { in: [...CLAVES_CONFIG] } },
  });
  const mapa = new Map(filas.map((fila) => [fila.clave, fila.valor]));

  const cantidad = Number(mapa.get("cuotas_cantidad") ?? DEFAULTS.cuotasCantidad);
  const diasNuevo = Number(
    mapa.get("dias_producto_nuevo") ?? DEFAULTS.diasProductoNuevo,
  );

  return {
    cuotasCantidad: Number.isFinite(cantidad) ? cantidad : DEFAULTS.cuotasCantidad,
    cuotasConInteres: mapa.get("cuotas_con_interes") === "true",
    diasProductoNuevo: Number.isFinite(diasNuevo) ? diasNuevo : DEFAULTS.diasProductoNuevo,
  };
}

/**
 * Guarda la configuración global con upserts en una transacción y revalida las
 * rutas públicas que dependen de estos valores.
 */
export async function guardarConfiguracion(
  input: unknown,
): Promise<ResultadoConfiguracion> {
  if (!(await esUsuarioAdmin())) {
    redirect("/");
  }

  const parsed = configuracionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los valores de configuración." };
  }

  const { cuotasCantidad, cuotasConInteres, diasProductoNuevo } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.configuracion.upsert({
        where: { clave: "cuotas_cantidad" },
        update: { valor: String(cuotasCantidad) },
        create: { clave: "cuotas_cantidad", valor: String(cuotasCantidad) },
      }),
      prisma.configuracion.upsert({
        where: { clave: "cuotas_con_interes" },
        update: { valor: String(cuotasConInteres) },
        create: { clave: "cuotas_con_interes", valor: String(cuotasConInteres) },
      }),
      prisma.configuracion.upsert({
        where: { clave: "dias_producto_nuevo" },
        update: { valor: String(diasProductoNuevo) },
        create: {
          clave: "dias_producto_nuevo",
          valor: String(diasProductoNuevo),
        },
      }),
    ]);
  } catch (error) {
    console.error("Error al guardar la configuración global:", error);
    return { ok: false, error: "Ocurrió un error al guardar la configuración." };
  }

  revalidatePath("/admin/configuracion", "layout");
  for (const ruta of RUTAS_PUBLICAS) {
    revalidatePath(ruta, "layout");
  }

  return { ok: true };
}