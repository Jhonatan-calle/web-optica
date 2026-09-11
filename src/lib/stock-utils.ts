import type { Prisma } from "@/generated/prisma/client";

interface ItemStock {
  id: string;
  varianteId: string | null;
  cantidad: number;
}

/**
 * Descuenta el stock de cada variante (solo si alcanza: nunca deja stock en
 * negativo) y marca `stockDescontado = true` en los ItemOrden cuyo stock sí se
 * descontó.
 *
 * Esto hace idempotente el descuento: cualquier transición a `PAGADO`
 * (webhook de Mercado Pago o aprobación manual del admin) solo descuenta los
 * ítems que todavía no fueron descontados.
 *
 * Debe ejecutarse dentro de un `$transaction`. Devuelve `true` si alguna
 * variante no tenía stock suficiente (alerta de stock).
 */
export async function descontarStock(
  tx: Prisma.TransactionClient,
  items: ItemStock[],
): Promise<boolean> {
  let stockFaltante = false;

  for (const item of items) {
    if (!item.varianteId) continue;

    const resultado = await tx.variante.updateMany({
      where: {
        id: item.varianteId,
        stock: { gte: item.cantidad },
      },
      data: { stock: { decrement: item.cantidad } },
    });

    if (resultado.count === 0) {
      stockFaltante = true;
      continue;
    }

    await tx.itemOrden.update({
      where: { id: item.id },
      data: { stockDescontado: true },
    });
  }

  return stockFaltante;
}

/**
 * Restaura el stock de las variantes de los ítems con `stockDescontado = true`
 * y vuelve el flag a `false`. Los ítems que nunca se descontaron (ej. variante
 * sin stock suficiente, o una orden que seguía PENDIENTE al cancelarse) se
 * omiten, evitando sobre-restaurar inventario.
 *
 * Debe ejecutarse dentro de un `$transaction`. Devuelve la cantidad de ítems
 * restaurados.
 */
export async function restaurarStock(
  tx: Prisma.TransactionClient,
  items: ItemStock[],
): Promise<number> {
  let restaurados = 0;

  for (const item of items) {
    if (!item.varianteId) continue;

    const registro = await tx.itemOrden.findUnique({
      where: { id: item.id },
      select: { stockDescontado: true },
    });

    if (!registro?.stockDescontado) continue;

    await tx.variante.update({
      where: { id: item.varianteId },
      data: { stock: { increment: item.cantidad } },
    });

    await tx.itemOrden.update({
      where: { id: item.id },
      data: { stockDescontado: false },
    });

    restaurados++;
  }

  return restaurados;
}