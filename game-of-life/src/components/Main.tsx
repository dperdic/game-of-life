"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

export default function Main({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { connected } = useWallet();

  return (
    <main className="mt-18 flex h-full w-full flex-grow items-center justify-center px-8 py-8 sm:px-16">
      {connected && status === "authenticated" ? (
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          <div className="w-full rounded-md bg-white p-8 text-center shadow">
            <h3 className="text-xl font-semibold">
              Sign in with your wallet to continue
            </h3>
          </div>
        </div>
      )}
    </main>
  );
}
