import { GRID_SIZE } from "@/utils/constants";
import { getProvider } from "@coral-xyz/anchor";

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
