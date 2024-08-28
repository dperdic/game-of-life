import { setProvider, AnchorProvider, workspace } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GameOfLife } from "../target/types/game_of_life";

describe("game-of-life", () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.env());

  const program = workspace.GameOfLife as Program<GameOfLife>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
