"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { checkoutSchema, type CheckoutDatos } from "@/lib/checkout-schema";
import { useCheckoutStore } from "@/lib/checkout-store";
import { useCartStore, selectTotalCount } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CAMPOS: {
  name: keyof CheckoutDatos;
  label: string;
  type: string;
  placeholder: string;
  inputMode?: "email" | "tel" | "numeric";
  autoComplete: string;
}[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "tu@email.com",
    inputMode: "email",
    autoComplete: "email",
  },
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Juan Pérez",
    autoComplete: "name",
  },
  {
    name: "telefono",
    label: "Teléfono",
    type: "tel",
    placeholder: "+54 11 1234 5678",
    inputMode: "tel",
    autoComplete: "tel",
  },
  {
    name: "dni",
    label: "DNI",
    type: "text",
    placeholder: "30123456",
    inputMode: "numeric",
    autoComplete: "off",
  },
];

export function CheckoutForm() {
  const setDatos = useCheckoutStore((state) => state.setDatos);
  const count = useCartStore(selectTotalCount);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutDatos>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      nombre: "",
      telefono: "",
      dni: "",
    },
  });

  const onSubmit = (datos: CheckoutDatos) => {
    if (count === 0) {
      toast.error("Tu carrito está vacío", {
        description: "Agregá productos antes de continuar.",
      });
      return;
    }
    setDatos(datos);
    toast.success("Datos guardados", {
      description: "El siguiente paso (entrega y pago) llega pronto.",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {CAMPOS.map((campo) => (
        <div key={campo.name} className="flex flex-col gap-1.5">
          <Label htmlFor={`checkout-${campo.name}`}>{campo.label}</Label>
          <Input
            id={`checkout-${campo.name}`}
            type={campo.type}
            inputMode={campo.inputMode}
            placeholder={campo.placeholder}
            autoComplete={campo.autoComplete}
            aria-invalid={!!errors[campo.name]}
            aria-describedby={
              errors[campo.name]
                ? `checkout-${campo.name}-error`
                : undefined
            }
            {...register(campo.name)}
          />
          {errors[campo.name]?.message && (
            <p
              id={`checkout-${campo.name}-error`}
              className="text-xs text-red-500"
            >
              {errors[campo.name]!.message}
            </p>
          )}
        </div>
      ))}

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Procesando…
          </>
        ) : (
          <>Continuar</>
        )}
      </Button>
    </form>
  );
}

export function CheckoutVacio() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">
        Tu carrito está vacío
      </p>
      <p className="text-sm text-muted-foreground">
        Agregá algunos productos antes de iniciar el checkout.
      </p>
      <Button
        variant="outline"
        render={<Link href="/catalogo" />}
        nativeButton={false}
      >
        Explorar Catálogo
      </Button>
    </div>
  );
}
