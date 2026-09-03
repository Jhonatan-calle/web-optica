import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  /**
   * Identificador único del item dentro del carrito.
   * Se genera al agregar, combinando la variante y su cantidad.
   */
  id: string;
  /** Id de la variante (precio/stock) en la base de datos. */
  varianteId: string;
  /** Id del producto al que pertenece la variante. */
  productoId: string;
  nombre: string;
  color?: string;
  material?: string;
  /** Precio unitario capturado como snapshot al momento de agregar. */
  precio: number;
  /** Imagen representativa (opcional) para la UI del carrito. */
  imagen?: string;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  /** Controla la apertura/cierre del drawer de carrito. */
  isOpen: boolean;
  /** True cuando el estado persistido ya fue hidratado desde localStorage. */
  hasHydrated: boolean;
  addItem: (
    item: Omit<CartItem, "id"> & { id?: string },
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.varianteId === item.varianteId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.varianteId === item.varianteId
                ? { ...i, cantidad: i.cantidad + item.cantidad }
                : i,
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              ...item,
              id: item.id ?? `${item.varianteId}-${Date.now()}`,
            },
          ],
        });
      },

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((i) => i.id !== itemId)
              : state.items.map((i) =>
                  i.id === itemId ? { ...i, cantidad } : i,
                ),
        })),

      clear: () => set({ items: [] }),

      setOpen: (open) => set({ isOpen: open }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "carrito-la-optica",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectTotalCount = (state: CartState): number =>
  state.items.reduce((acc, item) => acc + item.cantidad, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
