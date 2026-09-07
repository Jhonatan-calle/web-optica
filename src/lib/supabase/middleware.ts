import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getRol, ROL_ADMIN } from "@/lib/supabase/roles";

/** `/admin/login` se excluye del guard para no caer en un bucle de redirección. */
const esRutaAdminProtegida = (pathname: string) =>
  pathname.startsWith("/admin") && pathname !== "/admin/login";

/**
 * Refresca la sesión de Supabase en cada request y la propaga hacia los Server
 * Components (`request.cookies`) y hacia el navegador (`response.cookies`).
 *
 * Se usa desde `src/middleware.ts`; es la capa que mantiene el token al día.
 *
 * También protege `/admin/*`: sin sesión redirige a `/admin/login` (guardando
 * la ruta original en `next`); con sesión pero rol distinto de `ADMIN`
 * (leído de `app_metadata.rol`, ver `supabase/rol_app_metadata.sql`) redirige
 * a la tienda pública.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (esRutaAdminProtegida(pathname)) {
    if (!user) {
      const destino = `${pathname}${search}`;
      return NextResponse.redirect(
        new URL(`/admin/login?next=${encodeURIComponent(destino)}`, request.url),
      );
    }
    if (getRol(user) !== ROL_ADMIN) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}