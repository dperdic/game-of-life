declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_RPC_URL: string;
      NEXT_PUBLIC_SOL_CLUSTER: string;
      NEXT_PUBLIC_MERKLE_TREE: string;
      NEXT_PUBLIC_COLLECTION_NFT: string;
    }
  }
}

export {};
