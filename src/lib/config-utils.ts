import "server-only";

import type { ConfigCuotas } from "@/lib/product-utils";
import { prisma } from "@/lib/prisma";

const CLAVES_CUOTAS = ["cuotas_cantidad", "cuotas_con_interes"] as const;

const CUOTAS_DEFAULT: ConfigCuotas = {
  cantidad: 3,
  conInteres: false,
};

/**
 * Lee la configuración de cuotas desde la tabla `Configuracion`
 * (claves `cuotas_cantidad` y `cuotas_con_interes`).
 *
 * Si falta alguna clave o hay un error, devuelve los valores por defecto
 * (3 cuotas sin interés) para no romper la app.
 */
export async function obtenerConfigCuotas(): Promise<ConfigCuotas> {
  try {
    const filas = await prisma.configuracion.findMany({
      where: { clave: { in: [...CLAVES_CUOTAS] } },
    });

    const mapa = new Map(filas.map((fila) => [fila.clave, fila.valor]));

    const cantidad = Number(mapa.get("cuotas_cantidad") ?? CUOTAS_DEFAULT.cantidad);
    const conInteres =
      (mapa.get("cuotas_con_interes") ?? String(CUOTAS_DEFAULT.conInteres)) ===
      "true";

    return {
      cantidad:
        Number.isFinite(cantidad) && cantidad > 0
          ? cantidad
          : CUOTAS_DEFAULT.cantidad,
      conInteres,
    };
  } catch (error) {
    console.error("Error al leer configuración de cuotas:", error);
    return CUOTAS_DEFAULT;
  }
}