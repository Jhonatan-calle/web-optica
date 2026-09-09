"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { generarPreferenciaPago } from "@/lib/mercadopago-cliente";

interface BotonMercadoPagoProps {
  ordenId: string;
  total: number;
}

/**
 * Botón que genera la preferencia de Mercado Pago para la orden y redirige al
 * checkout seguro de la pasarela (Checkout Pro, flujo Redirect).
 */
export function BotonMercadoPago({ ordenId, total }: BotonMercadoPagoProps) {
  const [generando, setGenerando] = useState(false);

  async function irAlPago() {
    setGenerando(true);
    try {
      const resultado = await generarPreferenciaPago(ordenId);

      if (!resultado.ok || !resultado.initPoint) {
        toast.error("No se pudo iniciar el pago", {
          description:
            resultado.error ??
            "Ocurrió un error inesperado, intentá de nuevo en unos minutos.",
        });
        return;
      }

      window.location.href = resultado.initPoint;
    } catch {
      toast.error("No se pudo iniciar el pago", {
        description: "Ocurrió un error inesperado, intentá de nuevo.",
      });
    } finally {
      setGenerando(false);
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={irAlPago} disabled={generando}>
      {generando ? (
        <>
          <Loader2 className="animate-spin" />
          Generando el pago…
        </>
      ) : (
        `Pagar $${total.toLocaleString("es-AR")} con Mercado Pago`
      )}
    </Button>
  );
}