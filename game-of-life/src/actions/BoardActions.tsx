"use server";

import { getSession } from "@/lib/auth";
import { decryptAndUnpackBoard, packAndEncryptBoard } from "@/utils/functions";

export const packBoard = async (nftPublicKey: string, board: number[][]) => {
  return packAndEncryptBoard(
    board,
    `${nftPublicKey}${process.env.ENCRYPTION_SECRET_KEY}`,
  );
};

export const unpackBoard = async (
  publicKey: string,
  nftPublicKey: string,
  board: number[],
) => {
  const session = await getSession();

  if (session?.user?.name !== publicKey) {
    console.log("penis");
    return null;
  }

  // check if user is owner of the nft here

  return decryptAndUnpackBoard(
    board,
    `${nftPublicKey}${process.env.ENCRYPTION_SECRET_KEY}`,
  );
};
