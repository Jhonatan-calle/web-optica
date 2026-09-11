import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de la tienda en línea de La Óptica.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Términos y Condiciones
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Última actualización: septiembre de 2026.
      </p>

      <div className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            1. Aceptación de los términos
          </h2>
          <p>
            Al acceder o comprar en esta tienda en línea (la «Tienda») aceptás
            estos Términos y Condiciones. Si no estás de acuerdo, no utilices la
            Tienda.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Productos y precios
          </h2>
          <p>
            Los precios se muestran en pesos argentinos (ARS) e incluyen los
            impuestos correspondientes. El costo de envío se calcula en el
            momento de la compra. La Óptica se reserva el derecho de modificar
            precios y disponibilidad de stock sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            3. Compra y pago
          </h2>
          <p>
            Podés abonar online con Mercado Pago, por transferencia bancaria o
            en efectivo al retirar en el local. El pedido se confirma una vez
            que el pago es acreditado. En compras por transferencia, el pedido
            se aprueba manualmente al verificar el comprobante.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            4. Envíos
          </h2>
          <p>
            Los envíos a domicilio se despachan a través de nuestro operador
            logístico. Los plazos estimados se informan al cotizar el envío. Las
            compras con retiro en el local pueden retirarse una vez que el
            pedido figure como «Listo para retirar».
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            5. Cambios y arrepentimiento
          </h2>
          <p>
            Tenés derecho a ejercer el botón de arrepentimiento dentro de los
            10 (diez) días corridos de recibido el producto, según la normativa
            vigente. Consultá la sección correspondiente en el pie de página.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            6. Contacto
          </h2>
          <p>
            Ante cualquier consulta podés escribirnos por Instagram{" "}
            <a
              href="https://instagram.com/_laoptica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              @_laoptica
            </a>
            .
          </p>
        </section>

        <p className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          Documento modelo para el lanzamiento. Revisar con asesoramiento legal
          antes de su publicación definitiva.
        </p>
      </div>
    </main>
  );
}