import { Truck, CreditCard, Store } from "lucide-react";

const BENEFICIOS = [
  {
    icon: Truck,
    titulo: "Envío Nacional",
    descripcion: "Envíos a todo el país con el transportista.",
  },
  {
    icon: CreditCard,
    titulo: "3 Cuotas Sin Interés",
    descripcion: "Paga en 3 cuotas sin interés con tus tarjetas.",
  },
  {
    icon: Store,
    titulo: "Retiro Gratis en Local",
    descripcion: "Retirás tu compra sin costo en nuestro local físico.",
  },
];

export function ValueBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-lg bg-[#F9FAFB] p-6 sm:grid-cols-3 md:p-10">
        {BENEFICIOS.map((beneficio) => (
          <div
            key={beneficio.titulo}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-brand">
              <beneficio.icon size={22} />
            </span>
            <h3 className="text-sm font-semibold md:text-base">
              {beneficio.titulo}
            </h3>
            <p className="text-sm text-muted-foreground">
              {beneficio.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
