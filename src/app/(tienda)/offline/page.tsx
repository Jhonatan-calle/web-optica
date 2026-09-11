import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <WifiOff className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Parece que perdiste la conexión
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisá tu wifi o datos móviles y volvé a intentarlo. Tu carrito se
            conserva en este dispositivo.
          </p>
        </div>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}