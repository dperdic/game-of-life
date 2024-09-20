declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // public vars
      NEXT_PUBLIC_RPC_URL: string;
      NEXT_PUBLIC_SOL_CLUSTER: string;
      NEXT_PUBLIC_MERKLE_TREE: string;
      NEXT_PUBLIC_COLLECTION_NFT: string;
      NETX_PUBLIC_METADATA_URL: string;
      NEXT_PUBLIC_CNFT_SYMBOL: string;

      //server vars
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      ENCRYPTION_SECRET_KEY: string;
    }
  }
}

export {};
