import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo La Óptica recopila, usa y protege tus datos personales (Ley 25.326).",
};

export default function PoliticasDePrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Política de Privacidad
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Última actualización: septiembre de 2026.
      </p>

      <div className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            1. Datos que recopilamos
          </h2>
          <p>
            Para procesar tu compra recopilamos tu nombre, correo electrónico,
            teléfono y domicilio de entrega. No almacenamos datos de tarjetas de
            crédito: los pagos online se procesan íntegramente en Mercado Pago.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Finalidad y base legal
          </h2>
          <p>
            Tus datos se usan exclusivamente para gestionar pedidos, coordinar
            envíos, responder consultas y cumplir obligaciones legales y
            fiscales, conforme a la Ley 25.326 de Protección de Datos Personales.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            3. Compartir información
          </h2>
          <p>
            Compartimos solo los datos indispensables con terceros que hacen
            posible la operación: el operador logístico (para el envío) y
            Mercado Pago (para el pago). No vendemos ni cedemos tus datos a
            anunciantes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            4. Tus derechos (ARCO)
          </h2>
          <p>
            Podés ejercer los derechos de acceso, rectificación, actualización y
            supresión de tus datos escribiéndonos por Instagram{" "}
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

        <section>
          <h2 className="text-base font-semibold text-foreground">
            5. Conservación
          </h2>
          <p>
            Conservamos la información mientras sea necesaria para los fines
            descriptos o para cumplir con plazos legales de conservación de
            registros comerciales y fiscales.
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