import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Crear cuenta | La Óptica",
};

export default async function RegistroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registrate para agilizar tus próximas compras.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[#00848C] hover:underline"
        >
          Ingresar
        </Link>
      </p>
    </main>
  );
}