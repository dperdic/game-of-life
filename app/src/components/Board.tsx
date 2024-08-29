import { produce } from "immer";
import { useRef, useState } from "react";

const gridSize = 32;
const operations: number[][] = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

// push zeroes in all fields
const generateEmptyGrid = () => {
  const rows = [];

  for (let i = 0; i < gridSize; i++) {
    rows.push(Array.from(Array(gridSize), () => 0));
  }

  return rows;
};

const generateRandomGrid = () => {
  const rows = [];

  for (let i = 0; i < gridSize; i++) {
    rows.push(Array.from(Array(gridSize), () => (Math.random() > 0.7 ? 1 : 0)));
  }

  return rows;
};

function getRandomColor() {
  // Generate a random number between 0 and 16777215 (hex color range)
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  // Ensure the color is always 6 digits by padding with leading zeros if necessary
  return `#${randomColor.padStart(6, "0")}`;
}

export default function Board() {
  const [grid, setGrid] = useState<number[][]>(() => generateEmptyGrid());
  const [running, setRunning] = useState<boolean>(false);
  const [generation, setGeneration] = useState<number>(0);

  const runningRef = useRef(running);

  runningRef.current = running;

  const runSimulation = () => {
    if (!runningRef.current) {
      return;
    }

    setGeneration((currentGeneration) => currentGeneration + 1);

    setGrid((currentGrid) => {
      return produce(currentGrid, (gridCopy) => {
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (
                newI >= 0 &&
                newI < gridSize &&
                newJ >= 0 &&
                newJ < gridSize
              ) {
                neighbors += currentGrid[newI][newJ];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = 0;
            } else if (currentGrid[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 1000);
  };

  return (
    <div className="flex flex-col justify-center gap-4 overflow-hidden overflow-x-auto rounded-lg border bg-white p-4 shadow">
      <h3 className="text-center font-semibold">Generation {generation}</h3>

      <div className="flex justify-center">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 0fr)`,
          }}
        >
          {grid.map((row, i) =>
            row.map((_col, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => {
                  const newGrid = produce(grid, (gridCopy) => {
                    gridCopy[i][j] = grid[i][j] ? 0 : 1;
                  });

                  setGrid(newGrid);
                }}
                className="h-3 w-3 border border-gray-300"
                style={{
                  backgroundColor: grid[i][j] ? `${getRandomColor()}` : "white",
                }}
              ></div>
            )),
          )}
        </div>
      </div>

      <div className="flex flex-row justify-center gap-3">
        <button
          type="button"
          className="btn btn-md btn-blue"
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
          onClick={() => {
            setRunning(false);
            setGrid(() => generateEmptyGrid());
            runningRef.current = false;
            setGeneration(0);
          }}
        >
          Reset
        </button>

        <button
          type="button"
          className="btn btn-md btn-white"
          onClick={() => {
            setRunning(false);
            runningRef.current = false;
            setGeneration(0);

            setGrid(() => generateRandomGrid());
          }}
        >
          Randomize
        </button>
      </div>
    </div>
  );
}
