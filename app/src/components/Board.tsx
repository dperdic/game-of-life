import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";

const gridSize = 32;
const minSpeed = 0.5;
const maxSpeed = 16;
const initialSpeed = { value: 1, milliseconds: 1000 };
const surroundingFieldCoords: number[][] = [
  [-1, 0], // top
  [1, 0], // bottom
  [0, -1], // left
  [0, 1], // right
  [-1, 1], // top left
  [1, -1], // top right
  [-1, -1], // bottom left
  [1, 1], // bottom right
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
  const [generation, setGeneration] = useState<number>(0);
  const [grid, setGrid] = useState<number[][]>(() => generateEmptyGrid());

  const [running, setRunning] = useState<boolean>(false);
  const runningRef = useRef(running);

  const [speed, setSpeed] = useState(initialSpeed);
  const speedRef = useRef(speed.milliseconds);

  useEffect(() => {
    speedRef.current = speed.milliseconds;
  }, [speed]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGeneration((currentGeneration) => currentGeneration + 1);

    setGrid((currentGrid) => {
      return produce(currentGrid, (newGrid) => {
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            let neighbors = 0;

            surroundingFieldCoords.forEach(([x, y]) => {
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
    setSpeed(initialSpeed);

    setGrid(() => (randomize ? generateRandomGrid() : generateEmptyGrid()));
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
                className="size-4 border border-gray-300"
                style={{
                  backgroundColor: grid[i][j] ? "black" : "white",
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
          onClick={() => reset(false)}
        >
          Reset
        </button>

        <button
          type="button"
          className="btn btn-md btn-white"
          onClick={() => reset(true)}
        >
          Randomize
        </button>

        <div className="flex flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-white"
            onClick={() => modifySpeed(false)}
            disabled={speed.value <= minSpeed}
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
            onClick={() => modifySpeed(true)}
            disabled={speed.value >= maxSpeed}
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
      </div>
    </div>
  );
}
