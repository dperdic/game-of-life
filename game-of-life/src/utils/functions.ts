import { GRID_SIZE } from "@/utils/constants";
import { getProvider } from "@coral-xyz/anchor";
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

export const packBoard = (board: number[][]) => {
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

  return Array.from(packedData);
};

export const unpackBoard = (packedData: number[]): number[][] => {
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
): Uint8Array => {
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

  const dataToEncrypt = new Uint8Array(packedData.buffer);
  return encrypt(dataToEncrypt, secret);
};

// Updated unpacking function with decryption
export const decryptAndUnpackBoard = (
  encryptedData: Uint8Array,
  secret: string,
): number[][] | null => {
  const decryptedData = decrypt(encryptedData, secret);
  if (!decryptedData) return null;

  const packedData = new Uint32Array(decryptedData.buffer);
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
