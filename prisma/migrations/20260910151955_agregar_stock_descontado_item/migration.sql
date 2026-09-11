-- AlterTable
ALTER TABLE "ItemOrden" ADD COLUMN     "stockDescontado" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: los ítems de órdenes que ya fueron confirmadas (el stock de la
-- variante ya se descontó vía webhook de Mercado Pago) arrancan con el flag en
-- true. Así, cancelarlas restaura el stock correctamente.
UPDATE "ItemOrden" io
SET "stockDescontado" = true
FROM "Orden" o
WHERE io."ordenId" = o.id
  AND o."estado" IN ('PAGADO', 'EN_PREPARACION', 'DESPACHADO', 'LISTO_PARA_RETIRAR', 'ENTREGADO');
