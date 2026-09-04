export interface ConfigCuotas {
  cantidad: number;
  conInteres: boolean;
}

export const MOCK_CONFIG: ConfigCuotas = {
  cantidad: 3,
  conInteres: false,
};

export function calcularCuotas(
  precio: number,
  config: ConfigCuotas = MOCK_CONFIG,
): string {
  const valorCuota = Math.round(precio / config.cantidad);
  const interes = config.conInteres ? "con interés" : "sin interés";
  return `${config.cantidad} cuotas ${interes} de $${valorCuota.toLocaleString("es-AR")}`;
}

const DIAS_NUEVO = 21;

export function calcularBadge(
  precio: number,
  precioTransferencia?: number,
  createdAt?: string,
): string | undefined {
  if (precioTransferencia && precioTransferencia > 0 && precioTransferencia < precio) {
    const descuento = Math.round(100 * (1 - precioTransferencia / precio));
    return `${descuento}% OFF`;
  }
  if (createdAt) {
    const dias = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (dias <= DIAS_NUEVO) {
      return "NUEVO";
    }
  }
  return undefined;
}
