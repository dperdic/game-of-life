"use client";

import { createContext, useContext } from "react";
import { Program } from "@coral-xyz/anchor";
import { GameOfLife } from "@/idls/game_of_life";

export const ProgramContext = createContext<Program<GameOfLife> | undefined>(
  undefined,
);

export const useGameOfLifeProgramContext = () => {
  const context = useContext(ProgramContext);

  return context;
};
