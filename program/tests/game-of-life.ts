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
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchMerkleTree,
  getAssetWithProof,
  getChangeLogSerializer,
  getVerifyLeafInstructionDataSerializer,
  hashLeaf,
  mplBubblegum,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  publicKey,
  signerIdentity,
  sol,
} from "@metaplex-foundation/umi";

const BOARD_SIZE = 32;

const getPda = (program: Program<GameOfLife>, pdaSeed: PublicKey) => {
  const [address, bumpState] = PublicKey.findProgramAddressSync(
    [pdaSeed.toBytes()],
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

const generateRandomBoard = (): number[][] => {
  const rows = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    rows.push(
      Array.from(Array(BOARD_SIZE), () => (Math.random() > 0.7 ? 1 : 0)),
    );
  }

  return rows;
};

const packBoard = (board: number[][]): number[] => {
  const packedData = new Uint32Array(BOARD_SIZE);

  for (let row = 0; row < BOARD_SIZE; row++) {
    let packedRow = 0;

    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]) {
        packedRow |= 1 << col;
      }
    }

    packedData[row] = packedRow;
  }

  return Array.from(packedData);
};

const unpackBoard = (packedData: number[]): number[][] => {
  const board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(0));

  for (let row = 0; row < BOARD_SIZE; row++) {
    const packedRow = packedData[row];

    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = +((packedRow & (1 << col)) !== 0);
    }
  }

  return board;
};

// const hashPubkey = (pubkey: PublicKey, salt: string) => {
//   const combined = pubkey.toBase58() + salt;

//   return createHash("sha256").update(combined, "utf-8").digest("hex");
// };

describe("game-of-life", () => {
  setProvider(AnchorProvider.env());

  const program = workspace.GameOfLife as Program<GameOfLife>;

  const keyPair = getKeyPair();
  const deployProvider = getProvider();
  let initialBoard: number[][];

  let nftPubkey: PublicKey;
  let hashedPubkey: string;

  // const umi = createUmi(deployProvider.connection.rpcEndpoint, {
  //   commitment: "confirmed",
  // })
  //   .use(mplTokenMetadata())
  //   .use(mplBubblegum());

  // const asset = await getAssetWithProof(umi, publicKey(""));

  // const x = verifyLeaf(umi, {}).sendAndConfirm(umi, { confirm: "" });

  before(async () => {
    console.log("generating board...");

    initialBoard = generateRandomBoard();

    nftPubkey = Keypair.generate().publicKey;
  });

  it("Is initialized!", async () => {
    console.log("storing board...");

    const packedBoard = packBoard(initialBoard);

    const tx = await program.methods
      .initializeBoard(nftPubkey, packedBoard)
      .accounts({
        signer: keyPair.publicKey,
      })
      .rpc();

    const x = program.methods.initializeBoard(nftPubkey, packedBoard);

    await confirmTransaction(deployProvider, tx);

    console.log("Your transaction signature", tx);
  });

  after(async () => {
    console.log("comparing boards...");

    const board = getPda(program, nftPubkey);

    const fetchedBoard = await program.account.board.fetch(board);

    const unpackedBoard = unpackBoard(fetchedBoard.packedBoard);

    expect(unpackedBoard).to.deep.equal(initialBoard);
  });
});
