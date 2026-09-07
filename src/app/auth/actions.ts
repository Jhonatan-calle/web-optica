"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loginSchema, registroSchema } from "@/lib/auth-schema";
import { createClient } from "@/lib/supabase/server";

/** Base de la URL pública para el link de confirmación por email. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface AuthResultado {
  ok: boolean;
  error?: string;
  mensaje?: string;
}

/**
 * Inicia sesión con email y contraseña (Supabase Auth, PKCE).
 * En caso de error devuelve un mensaje genérico; si las credenciales son
 * válidas, refresca la caché y redirige a `next` (interno, por defecto `/`).
 * `/admin/login` pasa `next=/admin` para que el administrador caiga en el panel.
 */
export async function ingresar(
  _prevState: AuthResultado | null,
  formData: FormData,
): Promise<AuthResultado> {
  const datos = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(datos);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los datos ingresados." };
  }

  const nextRaw = String(formData.get("next") ?? "/");
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: datos.email,
    password: datos.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        ok: false,
        error:
          "Tu email todavía no está confirmado. Revisá tu bandeja de entrada y confirmá tu cuenta.",
      };
    }
    return {
      ok: false,
      error: "Email o contraseña incorrectos.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/**
 * Da de alta una cuenta (email + contraseña). El rol (CLIENT/ADMIN) lo asigna
 * el trigger SQL en la BD (`supabase/rol_app_metadata.sql`), nunca el cliente.
 *
 * Con confirmación de email activa devuelve `mensaje` pidiendo revisar la
 * bandeja; con confirmación desactivada (local/dev) redirige directo.
 */
export async function registrarse(
  _prevState: AuthResultado | null,
  formData: FormData,
): Promise<AuthResultado> {
  const datos = {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = registroSchema.safeParse(datos);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los datos ingresados." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      data: { nombre: datos.nombre },
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=/`,
    },
  });

  if (error) {
    return {
      ok: false,
      error:
        "No se pudo crear la cuenta. Verificá que el email no esté en uso e intentá de nuevo.",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    ok: true,
    mensaje:
      "Te enviamos un link de confirmación a tu email. Revisá tu bandeja de entrada (y spam) para activar tu cuenta.",
  };
}