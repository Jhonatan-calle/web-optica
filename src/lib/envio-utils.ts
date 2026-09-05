/**
 * Cálculo de tarifas de envío por código postal.
 *
 * ⚠️ Decisión B5 pendiente: hoy las tarifas salen de una tabla MOCK fija en el
 * frontend. Definir si en Fase 3 migran a una tabla propia en la base de datos
 * (ej. modelo `TarifaEnvio` por rango de CP) o a una API de transportista
 * (Correo Argentino, Andreani, OCA, Shipnow).
 */

export interface TarifaEnvio {
  rango: string;
  minimo: number;
  maximo: number;
  precio: number;
}

export const TARIFAS_ENVIO: TarifaEnvio[] = [
  { rango: "CABA y GBA", minimo: 1000, maximo: 1999, precio: 4500 },
  { rango: "Provincia de Buenos Aires", minimo: 2000, maximo: 6499, precio: 6200 },
  { rango: "Centro del país", minimo: 6500, maximo: 9999, precio: 7800 },
  { rango: "Resto del país", minimo: 10000, maximo: 99999, precio: 8900 },
];

export type ResultadoTarifaEnvio =
  | { estado: "invalido" }
  | { estado: "sin_cobertura" }
  | { estado: "ok"; precio: number };

/**
 * Calcula la tarifa de envío para un código postal argentino (4 dígitos).
 * - "invalido": el CP no tiene formato válido.
 * - "sin_cobertura": CP válido pero sin tarifa en los rangos configurados.
 * - "ok": devuelve el precio en `precio`.
 */
export function calcularTarifaEnvio(codigoPostal: string): ResultadoTarifaEnvio {
  const cpNum = parseInt(codigoPostal.replace(/\D/g, ""), 10);
  if (!cpNum || String(cpNum).length !== 4) {
    return { estado: "invalido" };
  }

  const tarifa = TARIFAS_ENVIO.find(
    (t) => cpNum >= t.minimo && cpNum <= t.maximo,
  );

  if (!tarifa) {
    return { estado: "sin_cobertura" };
  }

  return { estado: "ok", precio: tarifa.precio };
}