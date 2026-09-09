/** Formatea un monto en pesos argentinos (sin decimales). */
export function formatearPesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

/** Formatea una fecha en es-AR: dd/mm/yyyy HH:mm. */
export function formatearFecha(fecha: Date | string, timeZone?: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(fecha));
}