import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CheckoutDatos, EntregaDatos } from "@/lib/checkout-schema";

export type EntregaPersistida = EntregaDatos & { costoEnvio?: number };

interface CheckoutState {
  datos: CheckoutDatos | null;
  entrega: EntregaPersistida | null;
  hasHydrated: boolean;
  setDatos: (datos: CheckoutDatos) => void;
  setEntrega: (entrega: EntregaPersistida) => void;
  clearDatos: () => void;
  clearEntrega: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      datos: null,
      entrega: null,
      hasHydrated: false,

      setDatos: (datos) => set({ datos }),
      setEntrega: (entrega) => set({ entrega }),

      clearDatos: () => set({ datos: null }),
      clearEntrega: () => set({ entrega: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "checkout-la-optica",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        datos: state.datos,
        entrega: state.entrega,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);