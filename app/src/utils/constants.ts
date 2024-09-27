export const GRID_SIZE = 32;

export const MIN_SPEED = 0.5;

export const MAX_SPEED = 16;

export const INITIAL_SPEED = { value: 1, milliseconds: 1000 };

export const SURROUNDING_FIELD_COORDS: number[][] = [
  [0, 1], // top
  [0, -1], // bottom
  [-1, 0], // left
  [1, 0], // right
  [-1, 1], // top left
  [1, 1], // top right
  [-1, -1], // bottom left
  [1, -1], // bottom right
];

export enum ScreenType {
  Menu = 0,
  Board = 1,
}
