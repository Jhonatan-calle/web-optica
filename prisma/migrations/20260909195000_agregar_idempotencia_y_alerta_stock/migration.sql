-- AlterTable: idempotencia de pagos (un mpPaymentId no puede repetirse) y
-- alerta de stock insuficiente (flag para el panel admin).
ALTER TABLE "Orden" ADD COLUMN     "alertaStock" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_mpPaymentId_key" UNIQUE ("mpPaymentId");