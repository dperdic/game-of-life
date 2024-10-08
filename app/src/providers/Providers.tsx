"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import ProgramContextProvider from "@/providers/ProgramContextProvider";
import ToastProvider from "@/providers/ToastProvider";
import UmiContextProvider from "@/providers/UmiContextProvider";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient();

const WalletContextProviderDynamic = dynamic(
  async () => await import("./WalletContextProvider"),
  { ssr: false },
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SessionProvider>
        <WalletContextProviderDynamic>
          <ProgramContextProvider>
            <UmiContextProvider>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </UmiContextProvider>
          </ProgramContextProvider>
        </WalletContextProviderDynamic>
      </SessionProvider>
    </ToastProvider>
  );
}
