"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Program,
  Provider,
  getProvider,
  AnchorProvider,
  setProvider,
} from "@coral-xyz/anchor";
import { ProgramContext } from "@/providers/ProgramContext";
import { GameOfLife } from "@/idls/game_of_life";
import idl from "@/idls/game_of_life.json";

export default function ProgramContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState<Program<GameOfLife> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (wallet) {
      let provider: Provider;

      try {
        provider = getProvider();
      } catch (_error) {
        provider = new AnchorProvider(connection, wallet);
        setProvider(provider);
      }

      const program = new Program(idl as GameOfLife, provider);

      setProgram(program);
    } else {
      const program = new Program(idl as GameOfLife, { connection });

      setProgram(program);
    }
  }, [wallet, connection]);

  return (
    <ProgramContext.Provider value={program}>
      {children}
    </ProgramContext.Provider>
  );
}
