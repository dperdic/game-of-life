import { create } from "zustand";

interface TransactionStateStore {
  inProgress: boolean;
  setInProgress: (inProgress: boolean) => void;
}

export const useTransactionStateStore = create<TransactionStateStore>(
  (set) => ({
    inProgress: false,
    setInProgress: (inProgress) => set(() => ({ inProgress: inProgress })),
  }),
);
