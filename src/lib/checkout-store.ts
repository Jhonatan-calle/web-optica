import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CheckoutDatos, EntregaDatos, PagoDatos } from "@/lib/checkout-schema";

export type EntregaPersistida = EntregaDatos & { costoEnvio?: number };

/** Paso actual del checkout: 0 Datos, 1 Entrega, 2 Pago, 3 Confirmar. */
export type PasoCheckout = 0 | 1 | 2 | 3;

interface CheckoutState {
  datos: CheckoutDatos | null;
  entrega: EntregaPersistida | null;
  pago: PagoDatos | null;
  paso: PasoCheckout;
  hasHydrated: boolean;
  setDatos: (datos: CheckoutDatos) => void;
  setEntrega: (entrega: EntregaPersistida) => void;
  setPago: (pago: PagoDatos) => void;
  setPaso: (paso: PasoCheckout) => void;
  clearDatos: () => void;
  clearEntrega: () => void;
  clearPago: () => void;
  setHasHydrated: (value: boolean) => void;
}

function pasoDesdeDatos(
  datos: CheckoutDatos | null,
  entrega: EntregaPersistida | null,
  pago: PagoDatos | null,
): PasoCheckout {
  return !datos ? 0 : !entrega ? 1 : !pago ? 2 : 3;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      datos: null,
      entrega: null,
      pago: null,
      paso: 0,
      hasHydrated: false,

      setDatos: (datos) =>
        set((state) => ({ datos, paso: Math.max(state.paso, 1) as PasoCheckout })),
      setEntrega: (entrega) =>
        set((state) => ({
          entrega,
          pago: null,
          paso: Math.max(state.paso, 2) as PasoCheckout,
        })),
      setPago: (pago) =>
        set((state) => ({ pago, paso: Math.max(state.paso, 3) as PasoCheckout })),

      setPaso: (paso) => set({ paso }),

      clearDatos: () =>
        set({ datos: null, entrega: null, pago: null, paso: 0 }),
      clearEntrega: () =>
        set({ entrega: null, pago: null, paso: 1 }),
      clearPago: () =>
        set((state) => ({ pago: null, paso: Math.min(state.paso, 2) as PasoCheckout })),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "checkout-la-optica",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        datos: state.datos,
        entrega: state.entrega,
        pago: state.pago,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        state.setPaso(
          pasoDesdeDatos(state.datos, state.entrega, state.pago),
        );
      },
    },
  ),
);