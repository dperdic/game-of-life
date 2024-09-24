"use client";

import useMinter from "@/hooks/useMinter";
import { useProgramContext } from "@/providers/ProgramContext";
import {
  useBoardStateStore,
  useTransactionStateStore,
} from "@/app/_store/gameOfLifeStore";
import {
  GRID_SIZE,
  INITIAL_SPEED,
  SURROUNDING_FIELD_COORDS,
  MIN_SPEED,
  MAX_SPEED,
} from "@/utils/constants";
import {
  confirmTransaction,
  generateEmptyGrid,
  generateRandomGrid,
  getBoardPda,
} from "@/utils/functions";
import { PublicKey } from "@solana/web3.js";
import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { packBoard, unpackBoard } from "@/actions/BoardActions";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Board() {
  const program = useProgramContext();
  const { publicKey } = useWallet();
  const { status } = useSession();
  const { playable, grid, setGrid, setPlayable } = useBoardStateStore();
  const { inProgress, setInProgress } = useTransactionStateStore();

  const { mintToCollection } = useMinter();

  const [generation, setGeneration] = useState<number>(0);
  const [localName, setLocalName] = useState<string>("");
  const [localGrid, setLocalGrid] = useState<number[][]>(() =>
    generateEmptyGrid(),
  );

  const [running, setRunning] = useState<boolean>(false);
  const runningRef = useRef(running);

  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const speedRef = useRef(speed.milliseconds);

  useEffect(() => {
    speedRef.current = speed.milliseconds;
  }, [speed]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const handleNewGame = async () => {
    setInProgress(true);

    if (!program) {
      setInProgress(false);
      return;
    }

    if (!localName) {
      setInProgress(false);
      return;
    }

    const cNftId = await mintToCollection(localName);

    if (!cNftId) {
      setInProgress(false);
      return;
    }

    const newBoard = await packBoard(cNftId, localGrid);

    console.log("packed board: ", newBoard);

    try {
      const tx = await program.methods
        .initializeBoard(new PublicKey(cNftId), newBoard)
        .rpc();

      const confirmation = await confirmTransaction(tx);

      if (confirmation.value.err) {
        console.error(confirmation.value.err);
        toast.error("An error occured while confirming the transaction");

        setInProgress(false);
        return;
      }

      setGrid(localGrid);

      const pda = getBoardPda(program, new PublicKey(cNftId));

      const { packedBoard } = await program.account.board.fetch(pda);

      const decryptedBoard = await unpackBoard(
        publicKey?.toBase58()!,
        cNftId,
        packedBoard,
      );

      console.log("decrypted board: ", decryptedBoard);

      setPlayable(true);
    } catch (error) {
      console.error(error);
      toast.error("An error occured while initializing board");
    }

    setInProgress(false);
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGeneration((currentGeneration) => currentGeneration + 1);

    setLocalGrid((currentGrid) => {
      return produce(currentGrid, (newGrid) => {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            let neighbors = 0;

            SURROUNDING_FIELD_COORDS.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;

              if (
                newI >= 0 &&
                newI < GRID_SIZE &&
                newJ >= 0 &&
                newJ < GRID_SIZE
              ) {
                neighbors += currentGrid[newI][newJ];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              newGrid[i][j] = 0;
            } else if (currentGrid[i][j] === 0 && neighbors === 3) {
              newGrid[i][j] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, speedRef.current);
  }, []);

  const modifySpeed = (increase: boolean) => {
    setSpeed((currentSpeed) => ({
      value: increase ? currentSpeed.value * 2 : currentSpeed.value / 2,
      milliseconds: increase
        ? currentSpeed.milliseconds / 2
        : currentSpeed.milliseconds * 2,
    }));
  };

  const reset = (randomize: boolean) => {
    setRunning(false);
    setGeneration(0);

    setLocalGrid(() => (randomize ? generateRandomGrid() : grid));
  };

  return (
    <div className="flex flex-col justify-center gap-4 overflow-hidden overflow-x-auto rounded-lg border bg-white p-4 shadow">
      {status !== "authenticated" ? (
        <h3 className="text-xl font-semibold">Access denied</h3>
      ) : (
        <>
          <h3 className="text-center font-semibold">Generation {generation}</h3>

          <div className="flex justify-center">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 0fr)`,
              }}
            >
              {localGrid.map((row, i) =>
                row.map((_col, j) => (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => {
                      if (playable) {
                        return;
                      }

                      const newGrid = produce(localGrid, (gridCopy) => {
                        gridCopy[i][j] = localGrid[i][j] ? 0 : 1;
                      });

                      setLocalGrid(newGrid);
                    }}
                    className="size-4 border border-gray-300"
                    style={{
                      backgroundColor: localGrid[i][j] ? "black" : "white",
                    }}
                  ></div>
                )),
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center gap-3">
            {playable ? (
              <>
                <button
                  type="button"
                  className="btn btn-md btn-black"
                  disabled={inProgress}
                  onClick={() => {
                    setRunning((isRunning) => !isRunning);

                    if (!running) {
                      runningRef.current = true;

                      runSimulation();
                    }
                  }}
                >
                  {running ? "Stop" : "Start"}
                </button>

                <button
                  type="button"
                  className="btn btn-md btn-white"
                  disabled={inProgress}
                  onClick={() => reset(false)}
                >
                  Reset
                </button>

                <div className="flex flex-row gap-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-white"
                    disabled={speed.value <= MIN_SPEED}
                    onClick={() => modifySpeed(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <span className="py-3">{speed.value}x</span>

                  <button
                    type="button"
                    className="btn btn-sm btn-white"
                    disabled={speed.value >= MAX_SPEED}
                    onClick={() => modifySpeed(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-row justify-center gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={localName}
                    maxLength={10}
                    onChange={(event) => {
                      setLocalName(event.target.value);
                    }}
                    className="block rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-gray-800 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="btn btn-md btn-black"
                    onClick={handleNewGame}
                    disabled={inProgress || !localName}
                  >
                    New game
                  </button>
                </div>

                <div className="flex flex-row justify-center gap-3">
                  <button
                    type="button"
                    className="btn btn-md btn-white"
                    onClick={() => reset(true)}
                    disabled={inProgress}
                  >
                    Randomize
                  </button>

                  <button
                    type="button"
                    className="btn btn-md btn-white"
                    onClick={() => setLocalGrid(generateEmptyGrid())}
                    disabled={inProgress}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
