import { GameOfLife } from "@/idls/game_of_life";
import { GRID_SIZE } from "@/utils/constants";
import { getProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

export const confirmTransaction = async (tx: string) => {
  const provider = getProvider();

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

export const getPda = (program: Program<GameOfLife>, pdaSeed: PublicKey) => {
  const [address, bumpState] = PublicKey.findProgramAddressSync(
    [pdaSeed.toBytes()],
    program.programId,
  );

  return address;
};

export const generateEmptyGrid = () => {
  const rows = [];

  // push zeroes in all fields
  for (let i = 0; i < GRID_SIZE; i++) {
    rows.push(Array.from(Array(GRID_SIZE), () => 0));
  }

  return rows;
};

export const generateRandomGrid = () => {
  const rows = [];

  // randomly push 1 or 0 in all fields
  for (let i = 0; i < GRID_SIZE; i++) {
    rows.push(
      Array.from(Array(GRID_SIZE), () => (Math.random() > 0.7 ? 1 : 0)),
    );
  }

  return rows;
};

export const getRandomColor = () => {
  // Generate a random number between 0 and 16777215 (hex color range)
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  // Ensure the color is always 6 digits by padding with leading zeros if necessary
  return `#${randomColor.padStart(6, "0")}`;
};

const packBoard = (board: number[][]) => {
  const packedData = new Uint32Array(GRID_SIZE);

  for (let row = 0; row < GRID_SIZE; row++) {
    let packedRow = 0;

    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col]) {
        packedRow |= 1 << col;
      }
    }

    packedData[row] = packedRow;
  }

  return packedData;
};

const unpackBoard = (packedData: number[]): number[][] => {
  const board = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));

  for (let row = 0; row < GRID_SIZE; row++) {
    const packedRow = packedData[row];

    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = +((packedRow & (1 << col)) !== 0);
    }
  }

  return board;
};

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

const encrypt = (data: Uint8Array, secret: string): Uint8Array => {
  const { key, nonce } = deriveKeyAndNonce(secret);

  return nacl.secretbox(data, nonce, key);
};

const decrypt = (
  encryptedData: Uint8Array,
  secret: string,
): Uint8Array | null => {
  const { key, nonce } = deriveKeyAndNonce(secret);

  return nacl.secretbox.open(encryptedData, nonce, key);
};

export const packAndEncryptBoard = (
  board: number[][],
  secret: string,
): number[] => {
  const packedData = packBoard(board);

  const dataToEncrypt = new Uint8Array(packedData.buffer);

  return Array.from(encrypt(dataToEncrypt, secret));
};

export const decryptAndUnpackBoard = (
  encryptedData: number[],
  secret: string,
): number[][] | null => {
  const decryptedData = decrypt(new Uint8Array(encryptedData), secret);

  if (!decryptedData) {
    return null;
  }

  const packedData = Array.from(new Uint32Array(decryptedData.buffer).slice(8));

  return unpackBoard(packedData);
};
