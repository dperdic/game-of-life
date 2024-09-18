declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_RPC_URL: string;
      NEXT_PUBLIC_SOL_CLUSTER: string;
    }
  }
}

export {};
