import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";

export const metadata: Metadata = {
  title: "Ingresar | Panel La Óptica",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: nextParam } = await searchParams;
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/admin";

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect(esAdmin(data.user) ? "/admin" : "/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Panel de administración
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresá con tu cuenta de administrador.
        </p>
      </div>

      <LoginForm next={next} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="font-medium text-[#00848C] hover:underline"
        >
          Volver a la tienda
        </Link>
      </p>
    </main>
  );
}