import { toast } from "sonner";

export function showAddToCartToast(nombre: string) {
  toast.success("Producto agregado", {
    description: nombre,
    classNames: {
      title: "text-sm font-medium",
      description: "text-xs text-muted-foreground",
    },
  });
}
