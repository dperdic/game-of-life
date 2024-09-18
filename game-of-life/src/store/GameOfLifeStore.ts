import { ScreenType } from "@/utils/constants";
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

interface ScreenStateStore {
  screen: ScreenType;
  setScreen: (newScreen: ScreenType) => void;
}

export const useScreenStateStore = create<ScreenStateStore>((set) => ({
  screen: ScreenType.Menu,
  setScreen: (newScreen) => set(() => ({ screen: newScreen })),
}));
