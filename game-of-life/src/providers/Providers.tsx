"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import ProgramContextProvider from "./ProgramContextProvider";
import ToastProvider from "@/providers/ToastProvider";

const queryClient = new QueryClient();

const WalletContextProviderDynamic = dynamic(
  async () => await import("./WalletContextProvider"),
  { ssr: false },
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletContextProviderDynamic>
      <ProgramContextProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ProgramContextProvider>
    </WalletContextProviderDynamic>
  );
}
