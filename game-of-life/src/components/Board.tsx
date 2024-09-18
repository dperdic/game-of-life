"use client";

import useMinter from "@/hooks/useMinter";
import useUmi from "@/hooks/useUmi";
import { useProgramContext } from "@/providers/ProgramContext";
import {
  useBoardStateStore,
  useTransactionStateStore,
} from "@/store/gameOfLifeStore";
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
  packBoard,
} from "@/utils/functions";
import { PublicKey } from "@solana/web3.js";
import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function Board() {
  const { dasApiRpc } = useUmi();
  const { mintToCollection } = useMinter();
  const program = useProgramContext();

  const [generation, setGeneration] = useState<number>(0);
  const [localGrid, setLocalGrid] = useState<number[][]>(() =>
    generateEmptyGrid(),
  );

  const [running, setRunning] = useState<boolean>(false);
  const runningRef = useRef(running);

  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const speedRef = useRef(speed.milliseconds);

  const { playable, grid, setGrid, setPlayable } = useBoardStateStore();

  const { inProgress, setInProgress } = useTransactionStateStore();

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

    const cNftId = await mintToCollection("Game test collection", "$GOL", "");

    if (!cNftId) {
      setInProgress(false);
      return;
    }

    const packedBoard = packBoard(localGrid);

    try {
      const tx = await program.methods
        .initializeBoard(new PublicKey(cNftId), packedBoard)
        .rpc();

      const confirmation = await confirmTransaction(tx);

      if (confirmation.value.err) {
        console.error(confirmation.value.err);
        toast.error("An error occured while confirming transaction");

        setInProgress(false);
        return;
      }

      setGrid(localGrid);
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
    setSpeed(INITIAL_SPEED);

    setLocalGrid(() => (randomize ? generateRandomGrid() : grid));
  };

  return (
    <div className="flex flex-col justify-center gap-4 overflow-hidden overflow-x-auto rounded-lg border bg-white p-4 shadow">
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
          <>
            <button
              type="button"
              className="btn btn-md btn-black"
              onClick={handleNewGame}
              disabled={inProgress}
            >
              New game
            </button>

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
          </>
        )}
      </div>
    </div>
  );
}
