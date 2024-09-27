"use server";

import { getSession } from "@/lib/auth";
import { createClient } from "@/supabase/server";
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
import { decode } from "base64-arraybuffer";

const umi = createUmi(
  process.env.RPC_URL || clusterApiUrl(process.env.SOL_CLUSTER as Cluster),
  { commitment: "confirmed" },
)
  .use(mplTokenMetadata())
  .use(mplBubblegum())
  .use(dasApi());

const dasApiRpc = createDasApiDecorator(umi.rpc);

const supabase = createClient();
const bucket = process.env.SUPABASE_BUCKET;

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

  if (asset.ownership.owner !== publicKey(walletPublicKey)) {
    console.error("Invalid asset owner");
    return null;
  }

  return decryptAndUnpackBoard(
    board,
    `${nftPublicKey}${process.env.ENCRYPTION_SECRET_KEY}`,
  );
};

export const uploadNft = async (
  base64ImageString: string,
  name: string,
  description: string,
) => {
  const guid = crypto.randomUUID().split("-").join("");

  const { data: imageResponse, error: imageError } = await supabase.storage
    .from(bucket)
    .upload(`nfts/images/${guid}.png`, decode(base64ImageString), {
      upsert: true,
    });

  if (imageError) {
    console.error("NFT upload failed, an error occured while saving image");
    return;
  }

  const { data: storedFile } = supabase.storage
    .from(bucket)
    .getPublicUrl(imageResponse.path);

  const metadata = {
    name: name,
    image: storedFile.publicUrl,
    attributes: [
      {
        trait_type: "Category",
        value: "Game of life board",
      },
      {
        trait_type: "Game url",
        value: "https://game-of-life-six-khaki.vercel.app",
      },
    ],
    properties: {
      files: [
        {
          uri: storedFile.publicUrl,
          type: "image/png",
          cdn: true,
        },
      ],
      category: "image",
    },
    external_url: "https://game-of-life-six-khaki.vercel.app",
    description: description,
  };

  const { data: metadataResponse, error: metadataError } =
    await supabase.storage
      .from(bucket)
      .upload(`nfts/metadata/${guid}.json`, JSON.stringify(metadata), {
        contentType: "application/json",
        upsert: true,
      });

  if (metadataError) {
    console.error(
      "NFT upload failed, an error occured while uploading metadata",
    );

    return;
  }

  const { data: metadataUri } = supabase.storage
    .from(bucket)
    .getPublicUrl(metadataResponse.path);

  return metadataUri.publicUrl;
};
