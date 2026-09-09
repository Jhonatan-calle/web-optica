import "server-only";

import type { ConfigCuotas } from "@/lib/product-utils";
import { prisma } from "@/lib/prisma";

export interface ConfigGlobal {
  cuotas: ConfigCuotas;
  diasNuevo: number;
}

const CLAVES_CONFIG = [
  "cuotas_cantidad",
  "cuotas_con_interes",
  "dias_producto_nuevo",
] as const;

const CONFIG_DEFAULT: ConfigGlobal = {
  cuotas: { cantidad: 3, conInteres: false },
  diasNuevo: 21,
};

/**
 * Lee la configuración global de la tienda desde la tabla `Configuracion`
 * (claves `cuotas_cantidad`, `cuotas_con_interes` y `dias_producto_nuevo`).
 *
 * Si falta alguna clave o hay un error, devuelve los valores por defecto
 * (3 cuotas sin interés, 21 días para la etiqueta "NUEVO") para no romper la app.
 */
export async function obtenerConfigGlobal(): Promise<ConfigGlobal> {
  try {
    const filas = await prisma.configuracion.findMany({
      where: { clave: { in: [...CLAVES_CONFIG] } },
    });

    const mapa = new Map(filas.map((fila) => [fila.clave, fila.valor]));

    const cantidad = Number(
      mapa.get("cuotas_cantidad") ?? CONFIG_DEFAULT.cuotas.cantidad,
    );
    const conInteres =
      (mapa.get("cuotas_con_interes") ??
        String(CONFIG_DEFAULT.cuotas.conInteres)) === "true";

    const diasNuevo = Number(
      mapa.get("dias_producto_nuevo") ?? CONFIG_DEFAULT.diasNuevo,
    );

    return {
      cuotas: {
        cantidad:
          Number.isFinite(cantidad) && cantidad > 0
            ? cantidad
            : CONFIG_DEFAULT.cuotas.cantidad,
        conInteres,
      },
      diasNuevo:
        Number.isFinite(diasNuevo) && diasNuevo > 0
          ? diasNuevo
          : CONFIG_DEFAULT.diasNuevo,
    };
  } catch (error) {
    console.error("Error al leer la configuración global:", error);
    return CONFIG_DEFAULT;
  }
}

/**
 * Lee la configuración de cuotas desde la tabla `Configuracion`.
 * Wrapper de `obtenerConfigGlobal` (misma query, usa su default si falla).
 */
export async function obtenerConfigCuotas(): Promise<ConfigCuotas> {
  const config = await obtenerConfigGlobal();
  return config.cuotas;
}