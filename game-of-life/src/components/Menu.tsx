"use client";

import { useEffect, useState } from "react";
import {
  useBoardStateStore,
  useScreenStateStore,
  useTransactionStateStore,
} from "@/app/_store/gameOfLifeStore";
import useUmi from "@/hooks/useUmi";
import { ScreenType } from "@/utils/constants";
import { useProgramContext } from "@/providers/ProgramContext";
import { getBoardPda } from "@/utils/functions";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { unpackBoard } from "@/actions/BoardActions";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";

type CollectionAsset = {
  id: string;
  name: string;
};

export default function Menu() {
  const { umi, dasApiRpc } = useUmi();
  const { inProgress, setInProgress } = useTransactionStateStore();
  const { createNewGame, playExistingGame } = useBoardStateStore();
  const { setScreen } = useScreenStateStore();
  const { data: session } = useSession();
  const { publicKey: walletPublicKey } = useWallet();
  const [existingNfts, setExistingNfts] = useState<CollectionAsset[]>([]);

  const program = useProgramContext();

  const handleStartNewGame = async () => {
    createNewGame();
    setScreen(ScreenType.Board);
  };

  const handlePlayExistingGame = async (id: string) => {
    setInProgress(true);

    if (!program) {
      toast.error("program doesn't exist");
      setInProgress(false);

      return;
    }

    if (!umi) {
      toast.error("umi doesn't exist");
      setInProgress(false);

      return;
    }

    if (!walletPublicKey) {
      toast.error("Wallet not connected, public key does not exist");
      setInProgress(false);

      return;
    }

    try {
      const boardPda = getBoardPda(program, new PublicKey(id));

      const board = await program.account.board.fetch(boardPda);

      const unpackedBoard = await unpackBoard(
        walletPublicKey.toBase58(),
        id,
        board.packedBoard,
      );

      if (!unpackedBoard) {
        toast.error("board doesn't exist");
        setInProgress(false);

        return;
      }

      playExistingGame(unpackedBoard);
      setScreen(ScreenType.Board);
    } catch (error) {
      console.error(error);
      toast.error("An error occured while fetching the board");
    }

    setInProgress(true);
  };

  useEffect(() => {
    if (!umi || !dasApiRpc) {
      return;
    }

    dasApiRpc
      .getAssetsByOwner({
        owner: umi.identity.publicKey,
      })
      .then((res) => {
        const collectionAssets = res.items
          .filter(
            (x) =>
              x.grouping[0]?.group_value ===
              process.env.NEXT_PUBLIC_COLLECTION_NFT,
          )
          .map(
            (x) =>
              ({
                id: x.id,
                name: x.content.metadata.name,
              }) as CollectionAsset,
          );

        setExistingNfts(collectionAssets);
      });
  }, [dasApiRpc, umi]);

  return (
    <div className="flex flex-col justify-center gap-8 overflow-hidden overflow-x-auto rounded-lg border bg-white p-4 shadow">
      <h3 className="text-center text-xl font-semibold">Menu</h3>

      <div className="text-center">
        <button
          type="button"
          className="btn btn-md btn-black"
          onClick={handleStartNewGame}
        >
          New game
        </button>
      </div>

      {existingNfts && !!existingNfts.length && (
        <div className="space-y-4">
          <h3 className="text-center text-lg font-semibold">Your games</h3>

          <div className="flex flex-row flex-wrap justify-center gap-4">
            {existingNfts.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="btn btn-md btn-white"
                disabled={inProgress || !session}
                onClick={async () => {
                  await handlePlayExistingGame(asset.id);
                }}
              >
                {asset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
