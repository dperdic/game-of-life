import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import useUmi from "@/hooks/useUmi";
import { uploadNft } from "@/actions/BoardActions";

export default function useMinter() {
  const { umi } = useUmi();

  const mintToCollection = useCallback(
    async (imageString: string, name: string, description: string) => {
      if (!umi) {
        toast.error("Umi not initialized");

        return;
      }

      const merkleTreeAddress = process.env.NEXT_PUBLIC_MERKLE_TREE;
      const collectionAddress = process.env.NEXT_PUBLIC_COLLECTION_NFT;

      if (!merkleTreeAddress || !collectionAddress) {
        return;
      }

      try {
        const metadataUrl = await uploadNft(imageString, name, description);

        if (!metadataUrl) {
          throw "An error occured while uploading Nft";
        }

        const tx = await mintToCollectionV1(umi, {
          leafOwner: umi.identity.publicKey,
          merkleTree: publicKey(merkleTreeAddress),
          collectionMint: publicKey(collectionAddress),
          metadata: {
            name: name,
            symbol: process.env.NEXT_PUBLIC_CNFT_SYMBOL,
            uri: metadataUrl,
            sellerFeeBasisPoints: 10000,
            isMutable: true,
            collection: { key: publicKey(collectionAddress), verified: true },
            creators: [
              {
                address: umi.identity.publicKey,
                verified: true,
                share: 100,
              },
            ],
          },
        }).sendAndConfirm(umi, {
          confirm: {
            commitment: "confirmed",
          },
          send: {
            commitment: "confirmed",
            maxRetries: 3,
          },
        });

        toast.success(
          `Mint cNFT transaction hash: ${base58.deserialize(tx.signature)[0]}`,
        );

        const leaf = await parseLeafFromMintToCollectionV1Transaction(
          umi,
          tx.signature,
        );

        return leaf.id;
      } catch (error) {
        console.error(error);
        toast.error("An error occured while minting cNFT");
      }
    },
    [umi],
  );

  return useMemo(
    () => ({
      mintToCollection,
    }),
    [mintToCollection],
  );
}
