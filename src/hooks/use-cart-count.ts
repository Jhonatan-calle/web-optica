import { useCartStore, selectTotalCount } from "@/lib/cart-store";

export function useCartCount() {
  const count = useCartStore(selectTotalCount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  return { count, hasHydrated };
}
