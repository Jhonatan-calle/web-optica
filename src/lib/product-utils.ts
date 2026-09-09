export interface ConfigCuotas {
  cantidad: number;
  conInteres: boolean;
}

export function calcularCuotas(precio: number, config: ConfigCuotas): string {
  const valorCuota = Math.round(precio / config.cantidad);
  const interes = config.conInteres ? "con interés" : "sin interés";
  return `${config.cantidad} cuotas ${interes} de $${valorCuota.toLocaleString("es-AR")}`;
}

const DIAS_NUEVO_DEFAULT = 21;

export function calcularBadge(
  precio: number,
  precioTransferencia?: number,
  createdAt?: string,
  diasNuevo: number = DIAS_NUEVO_DEFAULT,
): string | undefined {
  if (precioTransferencia && precioTransferencia > 0 && precioTransferencia < precio) {
    const descuento = Math.round(100 * (1 - precioTransferencia / precio));
    return `${descuento}% OFF`;
  }
  if (createdAt) {
    const dias = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (dias <= diasNuevo) {
      return "NUEVO";
    }
  }
  return undefined;
}
