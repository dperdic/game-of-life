"use server";

import { getSession } from "@/lib/auth";
import { decryptAndUnpackBoard, packAndEncryptBoard } from "@/utils/functions";
import {
  dasApi,
  createDasApiDecorator,
} from "@metaplex-foundation/digital-asset-standard-api";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Cluster, clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(
  process.env.RPC_URL || clusterApiUrl(process.env.SOL_CLUSTER as Cluster),
  { commitment: "confirmed" },
)
  .use(mplTokenMetadata())
  .use(mplBubblegum())
  .use(dasApi());

const dasApiRpc = createDasApiDecorator(umi.rpc);

export const packBoard = async (nftPublicKey: string, board: number[][]) => {
  return packAndEncryptBoard(
    board,
    `${nftPublicKey}${process.env.ENCRYPTION_SECRET_KEY}`,
  );
};

export const unpackBoard = async (
  walletPublicKey: string,
  nftPublicKey: string,
  board: number[],
) => {
  const session = await getSession();

  if (session?.user?.name !== walletPublicKey) {
    console.error("invalid user: ", session?.user?.name, walletPublicKey);
    return null;
  }

  const asset = await dasApiRpc.getAsset(publicKey(nftPublicKey));

  if (!asset) {
    console.error("No asset with public key ", nftPublicKey);
    return null;
  }

  if (asset.burnt) {
    console.error("Asset burnt");
    return null;
  }

  if (asset.ownership.owner !== publicKey(nftPublicKey)) {
    console.error("Invalid asset owner");
    return null;
  }

  return decryptAndUnpackBoard(
    board,
    `${nftPublicKey}${process.env.ENCRYPTION_SECRET_KEY}`,
  );
};
