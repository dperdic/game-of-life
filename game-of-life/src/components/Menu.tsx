"use client";

import useMinter from "@/hooks/useMinter";
import useUmi from "@/hooks/useUmi";
import { publicKey } from "@metaplex-foundation/umi";
import { useEffect } from "react";

export default function Menu() {
  const { umi, dasApiRpc } = useUmi();
  const { mintToCollection } = useMinter();

  const handleStartNewGame = async () => {
    const cNftId = await mintToCollection("Game of life test", "$GOL", "");

    console.log(cNftId!.toString());
  };

  useEffect(() => {
    if (!umi || !dasApiRpc) {
      return;
    }

    dasApiRpc
      .getAssetsByOwner({
        owner: publicKey("3G4Pg28khwAuBSeocC2PdVbPoUquj5Gm4GfYvd2pt8VS"),
      })
      .then((res) =>
        console.log(
          res.items.filter(
            (x) =>
              x.grouping[0].group_value ===
              "6MGjmJZjMxJCy3Pxqt7C3CGvGWmYXfspmzuZf2cGWMXz",
          ),
        ),
      );
  }, [dasApiRpc, umi]);

  return (
    <div className="flex flex-col justify-center gap-4 overflow-hidden overflow-x-auto rounded-lg border bg-white p-4 shadow">
      <h3 className="text-center font-semibold">Menu</h3>

      <div className="flex flex-col justify-center gap-4">
        <div className="text-center">
          <button
            type="button"
            className="btn btn-md btn-black"
            onClick={handleStartNewGame}
          >
            Start new game
          </button>
        </div>

        <div className="flex flex-row flex-wrap gap-4">{}</div>
      </div>
    </div>
  );
}
