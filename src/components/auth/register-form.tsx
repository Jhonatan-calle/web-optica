"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { registrarse, type AuthResultado } from "@/app/(tienda)/auth/actions";
import { registroSchema, type RegistroDatos } from "@/lib/auth-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroDatos>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombre: "", email: "", password: "" },
  });

  const onSubmit = async (datos: RegistroDatos) => {
    setError(null);
    setMensaje(null);
    const formData = new FormData();
    formData.set("nombre", datos.nombre);
    formData.set("email", datos.email);
    formData.set("password", datos.password);
    const resultado: AuthResultado = await registrarse(null, formData);
    if (resultado.error) setError(resultado.error);
    if (resultado.mensaje) setMensaje(resultado.mensaje);
  };

  if (mensaje) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-brand/30 bg-brand-muted px-6 py-8 text-center">
        <MailCheck className="h-10 w-10 text-[#00848C]" />
        <p className="text-sm font-medium text-foreground">{mensaje}</p>
        <p className="text-xs text-muted-foreground">
          Podés cerrar esta página o intentar iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registro-nombre">Nombre</Label>
        <Input
          id="registro-nombre"
          type="text"
          placeholder="Juan Pérez"
          autoComplete="name"
          aria-invalid={!!errors.nombre}
          {...register("nombre")}
        />
        {errors.nombre?.message && (
          <p className="text-xs text-red-500">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registro-email">Email</Label>
        <Input
          id="registro-email"
          type="email"
          inputMode="email"
          placeholder="tu@email.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registro-password">Contraseña</Label>
        <Input
          id="registro-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Creando cuenta…
          </>
        ) : (
          <>Crear cuenta</>
        )}
      </Button>
    </form>
  );
}