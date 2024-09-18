"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ReactNode } from "react";

export default function Main({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();

  return (
    <main className="mt-18 flex h-full w-full flex-grow items-center justify-center px-8 py-8 sm:px-16">
      {publicKey ? (
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          <div className="w-full rounded-md bg-white p-8 text-center shadow">
            <h3 className="text-xl font-semibold">
              Connect a wallet to continue
            </h3>
          </div>
        </div>
      )}
    </main>
  );
}
