import { ScreenType } from "@/utils/constants";
import { generateEmptyGrid } from "@/utils/functions";
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

interface BoardStateStore {
  newGame: boolean;
  playable: boolean;
  grid: number[][];
  setNewGame: (isNewGame: boolean) => void;
  setPlayable: (isPlayable: boolean) => void;
  setGrid: (newGrid: number[][]) => void;
  createNewGame: () => void;
  playExistingGame: (grid: number[][]) => void;
  resetGame: () => void;
}

export const useBoardStateStore = create<BoardStateStore>((set) => ({
  newGame: true,
  playable: false,
  grid: generateEmptyGrid(),
  setNewGame: (isNewGame) => set((state) => ({ ...state, newGame: isNewGame })),
  setPlayable: (isPlayable) =>
    set((state) => ({ ...state, playable: isPlayable })),
  setGrid: (newGrid) => set((state) => ({ ...state, grid: newGrid })),

  createNewGame: () =>
    set(() => ({
      newGame: true,
      playable: false,
      grid: generateEmptyGrid(),
    })),

  playExistingGame: (grid) =>
    set(() => ({
      grid: grid,
      newGame: false,
      playable: true,
    })),

  resetGame: () =>
    set(() => ({
      newGame: true,
      playable: false,
      grid: generateEmptyGrid(),
    })),
}));
