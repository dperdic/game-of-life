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
import nacl from "tweetnacl";

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

// const packBoard = (board: number[][]) => {
//   const packedData = new Uint32Array(BOARD_SIZE);

//   for (let row = 0; row < BOARD_SIZE; row++) {
//     let packedRow = 0;

//     for (let col = 0; col < BOARD_SIZE; col++) {
//       if (board[row][col]) {
//         packedRow |= 1 << col;
//       }
//     }

//     packedData[row] = packedRow;
//   }

//   return packedData;
//   return Array.from(packedData);
// };

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

// Function to derive a key and nonce from a secret
const deriveKeyAndNonce = (
  secret: string,
): { key: Uint8Array; nonce: Uint8Array } => {
  const encoder = new TextEncoder();

  const secretUint8 = encoder.encode(secret);

  const hash = nacl.hash(secretUint8);

  return {
    key: hash.subarray(0, 32),
    nonce: hash.subarray(32, 32 + 24),
  };
};

// Encryption function
const encrypt = (data: Uint8Array, secret: string): Uint8Array => {
  const { key, nonce } = deriveKeyAndNonce(secret);

  return nacl.secretbox(data, nonce, key);
};

// Decryption function
const decrypt = (
  encryptedData: Uint8Array,
  secret: string,
): Uint8Array | null => {
  const { key, nonce } = deriveKeyAndNonce(secret);

  return nacl.secretbox.open(encryptedData, nonce, key);
};

// Updated packing function with encryption
export const packAndEncryptBoard = (
  board: number[][],
  secret: string,
): number[] => {
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

  console.log(packedData);

  const dataToEncrypt = new Uint8Array(packedData.buffer);

  return Array.from(encrypt(dataToEncrypt, secret));
};

// Updated unpacking function with decryption
export const decryptAndUnpackBoard = (
  encryptedData: number[],
  secret: string,
): number[][] | null => {
  const decryptedData = decrypt(new Uint8Array(encryptedData), secret);

  if (!decryptedData) {
    return null;
  }

  const packedData = Array.from(new Uint32Array(decryptedData.buffer).slice(8));

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

describe("encryption tests", () => {
  const randomBoard = generateRandomBoard();

  const secret =
    "9722abd2533c57666c527000b6ee9e3dfb1cd9bee5ca6ecd00bc561bc8fd4612";
  const publicKey = Keypair.generate().publicKey.toBase58();

  it("should work", () => {
    const packedAndEncrypted = packAndEncryptBoard(
      randomBoard,
      `${publicKey}${secret}`,
    );

    console.log(packedAndEncrypted.length);

    const unpackedAndDecrypted = decryptAndUnpackBoard(
      packedAndEncrypted,
      `${publicKey}${secret}`,
    );

    expect(randomBoard).to.deep.eq(unpackedAndDecrypted);
  });
});

// describe("game-of-life", () => {
//   setProvider(AnchorProvider.env());

//   const program = workspace.GameOfLife as Program<GameOfLife>;

//   const keyPair = getKeyPair();
//   const deployProvider = getProvider();
//   let initialBoard: number[][];

//   let nftPubkey: PublicKey;
//   let hashedPubkey: string;

//   // const umi = createUmi(deployProvider.connection.rpcEndpoint, {
//   //   commitment: "confirmed",
//   // })
//   //   .use(mplTokenMetadata())
//   //   .use(mplBubblegum());

//   // const asset = await getAssetWithProof(umi, publicKey(""));

//   // const x = verifyLeaf(umi, {}).sendAndConfirm(umi, { confirm: "" });

//   before(async () => {
//     console.log("generating board...");

//     initialBoard = generateRandomBoard();

//     nftPubkey = Keypair.generate().publicKey;
//   });

//   it("Is initialized!", async () => {
//     console.log("storing board...");

//     const packedBoard = packBoard(initialBoard);

//     const tx = await program.methods
//       .initializeBoard(nftPubkey, packedBoard)
//       .accounts({
//         signer: keyPair.publicKey,
//       })
//       .rpc();

//     const x = program.methods.initializeBoard(nftPubkey, packedBoard);

//     await confirmTransaction(deployProvider, tx);

//     console.log("Your transaction signature", tx);
//   });

//   after(async () => {
//     console.log("comparing boards...");

//     const board = getPda(program, nftPubkey);

//     const fetchedBoard = await program.account.board.fetch(board);

//     const unpackedBoard = unpackBoard(fetchedBoard.packedBoard);

//     expect(unpackedBoard).to.deep.equal(initialBoard);
//   });
// });
