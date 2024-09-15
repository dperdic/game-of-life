import {
  setProvider,
  AnchorProvider,
  workspace,
  Provider,
  getProvider,
} from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GameOfLife } from "../target/types/game_of_life";
import { Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import { expect } from "chai";

const GRID_SIZE = 32;

const getPda = (program: Program<GameOfLife>, pdaSeed: string) => {
  const [address, bumpState] = PublicKey.findProgramAddressSync(
    [Buffer.from(pdaSeed)],
    program.programId,
  );

  return address;
};

const getKeyPair = () => {
  const secretKeyString: string = fs.readFileSync(
    `${process.env.HOME}/.config/solana/id.json`,
    { encoding: "utf-8" },
  );

  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));

  return Keypair.fromSecretKey(secretKey);
};

const confirmTransaction = async (provider: Provider, tx: string) => {
  const bh = await provider.connection.getLatestBlockhash();

  return await provider.connection.confirmTransaction(
    {
      signature: tx,
      blockhash: bh.blockhash,
      lastValidBlockHeight: bh.lastValidBlockHeight,
    },
    "confirmed",
  );
};

const generateRandomGrid = (): number[][] => {
  const rows = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    rows.push(
      Array.from(Array(GRID_SIZE), () => (Math.random() > 0.7 ? 1 : 0)),
    );
  }

  return rows;
};

const packGrid = (grid: number[][]): number[] => {
  const packedData = new Uint32Array(32);

  for (let row = 0; row < 32; row++) {
    let packedRow = 0;

    for (let col = 0; col < 32; col++) {
      if (grid[row][col]) {
        packedRow |= 1 << col;
      }
    }

    packedData[row] = packedRow;
  }
  return Array.from(packedData);
};

const unpackGrid = (packedData: number[]): number[][] => {
  const grid = Array(32)
    .fill(null)
    .map(() => Array(32).fill(false));

  for (let row = 0; row < 32; row++) {
    const packedRow = packedData[row];

    for (let col = 0; col < 32; col++) {
      grid[row][col] = Number((packedRow & (1 << col)) !== 0);
    }
  }
  return grid;
};

describe("game-of-life", () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.env());

  const program = workspace.GameOfLife as Program<GameOfLife>;

  const keyPair = getKeyPair();
  const deployProvider = getProvider();

  let initialGrid: number[][];

  before(async () => {
    console.log("generating grid...");

    initialGrid = generateRandomGrid();
  });

  it("Is initialized!", async () => {
    console.log("storing grid...");

    const packedGrid = packGrid(initialGrid);

    const tx = await program.methods
      .initializeBoard(packedGrid)
      .accounts({
        signer: keyPair.publicKey,
      })
      .rpc();

    await confirmTransaction(deployProvider, tx);

    console.log("Your transaction signature", tx);
  });

  after(async () => {
    console.log("comparing grids...");

    const grid = getPda(program, "grid");

    const fetchedGrid = await program.account.grid.fetch(grid);

    const unpackedGrid = unpackGrid(fetchedGrid.packedGrid);

    expect(unpackedGrid).to.deep.equal(initialGrid);
  });
});
