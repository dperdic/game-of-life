import { DasApiInterface } from "@metaplex-foundation/digital-asset-standard-api";
import { RpcInterface, Umi } from "@metaplex-foundation/umi";
import { createContext } from "react";

export type UmiContext = {
  umi: Umi | null;
  dasApiRpc: (RpcInterface & DasApiInterface) | null;
};

const DEFAULT_CONTEXT: UmiContext = {
  umi: null,
  dasApiRpc: null,
};

export const UmiContext = createContext<UmiContext>(DEFAULT_CONTEXT);
