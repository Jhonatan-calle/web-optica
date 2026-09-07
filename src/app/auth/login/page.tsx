import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ingresar | La Óptica",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ingresar
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accedé con tu email y contraseña.
        </p>
      </div>

      {error === "confirmacion" && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          No pudimos confirmar tu cuenta. El link puede haber expirado; intentá
          iniciar sesión con tu email y contraseña.
        </div>
      )}

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href="/auth/registro"
          className="font-medium text-[#00848C] hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </main>
  );
}