"use client";

import { ReactNode, useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Cluster, clusterApiUrl } from "@solana/web3.js";
import "@/providers/WalletContextProvider.css";
import { Adapter, WalletError } from "@solana/wallet-adapter-base";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";

export default function WalletContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (!rpcUrl || rpcUrl === "") {
      return clusterApiUrl(process.env.NEXT_PUBLIC_SOL_CLUSTER as Cluster);
    }

    return rpcUrl;
  }, []);

  const onError = useCallback(async (error: WalletError, adapter?: Adapter) => {
    console.error(error);
    toast.error(error.message ? `${error.name}: ${error.message}` : error.name);

    await signOut({ redirect: false });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect={true} onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
