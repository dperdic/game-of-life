declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // public vars
      NEXT_PUBLIC_RPC_URL: string;
      NEXT_PUBLIC_SOL_CLUSTER: string;
      NEXT_PUBLIC_MERKLE_TREE: string;
      NEXT_PUBLIC_COLLECTION_NFT: string;
      NEXT_PUBLIC_CNFT_SYMBOL: string;

      //server vars
      RPC_URL: string;
      SOL_CLUSTER: string;
      ENCRYPTION_SECRET_KEY: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      SUPABASE_BUCKET: string;
    }
  }
}

export {};
