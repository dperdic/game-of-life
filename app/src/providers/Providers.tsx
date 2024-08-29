import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProgramContextProvider from "./ProgramContextProvider";
import WalletContextProvider from "./WalletContextProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <ProgramContextProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ProgramContextProvider>
    </WalletContextProvider>
  );
}
