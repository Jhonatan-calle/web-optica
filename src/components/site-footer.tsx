import Link from "next/link";

import { cn } from "@/lib/utils";

const INSTAGRAM_HANDLE = "@_laoptica";
const INSTAGRAM_URL = "https://instagram.com/_laoptica";

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto w-full shrink-0 border-t bg-background",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isologo.svg" alt="La Óptica" className="h-8 w-auto" />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Anteojos de sol, clip-ons, armazones y accesorios. Calidad y diseño
            para tu mirada.
          </p>
        </div>

        <nav aria-label="La Óptica">
          <h3 className="mb-3 text-sm font-semibold">La Óptica</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/catalogo" className="hover:text-foreground">
                Líneas
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-foreground">
                Carrito
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-foreground">
                Contacto
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h3 className="mb-3 text-sm font-semibold">Legal</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="hover:text-foreground"
              >
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/politicas-de-privacidad"
                className="hover:text-foreground"
              >
                Políticas de Privacidad / Cambios
              </Link>
            </li>
            <li>
              <Link
                href="/boton-de-arrepentimiento"
                className="font-medium text-brand hover:text-brand/80"
              >
                Botón de Arrepentimiento
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Seguinos</h3>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Instagram {INSTAGRAM_HANDLE}
            </a>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Data Fiscal</h3>
            <p className="text-xs text-muted-foreground">
              Espacio reservado para el Código QR del Formulario 960/D
              (AFIP).
            </p>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} La Óptica. Todos los derechos reservados.</p>
          <p>Instagram {INSTAGRAM_HANDLE}</p>
        </div>
      </div>
    </footer>
  );
}
