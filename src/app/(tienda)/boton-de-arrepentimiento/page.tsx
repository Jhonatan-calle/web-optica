import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Botón de Arrepentimiento",
  description:
    "Ejercé tu derecho de arrepentimiento y solicitá el reintegro de tu compra en La Óptica.",
};

export default function BotonDeArrepentimientoPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Botón de Arrepentimiento
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Última actualización: septiembre de 2026.
      </p>

      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          De acuerdo con la normativa vigente de protección al consumidor (Ley
          24.240 y su reglamentación), tenés derecho a dejar sin efecto la
          compra dentro de los <strong className="text-foreground">10 días corridos</strong> a
          partir de la recepción del producto, sin necesidad de expresar causa.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            ¿Cómo ejercer el derecho?
          </h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Contactanos por Instagram{" "}
              <a
                href="https://instagram.com/_laoptica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                @_laoptica
              </a>{" "}
              indicando que querés ejercer el botón de arrepentimiento e
              incluyendo el número de pedido.
            </li>
            <li>
              Te confirmaremos los pasos a seguir y, si corresponde, las
              condiciones para el retiro/despacho del producto.
            </li>
            <li>
              Dentro de los plazos previstos por la normativa se te reintegrará
              lo abonado por el mismo medio que usaste para pagar.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            Condiciones
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              El producto debe estar en su estado original, con el packaging y
              los accesorios incluidos.
            </li>
            <li>
              El reintegro se realiza una vez recibido y verificado el
              producto.
            </li>
            <li>
              Los costos de envío del reintegro pueden quedar a cargo del
              consumidor según lo previsto en la normativa aplicable.
            </li>
          </ul>
        </section>

        <p className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          Documento modelo para el lanzamiento. Revisar con asesoramiento legal
          antes de su publicación definitiva.
        </p>
      </div>
    </main>
  );
}