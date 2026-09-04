import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CheckoutDatos } from "@/lib/checkout-schema";

interface CheckoutState {
  datos: CheckoutDatos | null;
  hasHydrated: boolean;
  setDatos: (datos: CheckoutDatos) => void;
  clearDatos: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      datos: null,
      hasHydrated: false,

      setDatos: (datos) => set({ datos }),
      clearDatos: () => set({ datos: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "checkout-la-optica",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ datos: state.datos }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
