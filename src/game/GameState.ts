import { OBSTACLE_TYPES, type ObstacleState } from './entities/Obstacle';
import { GameMode } from './Modes';
import { readJson, removeStorage, STORAGE_KEYS, writeJson } from './Storage';
import type { Point } from './Utils';

export type SavedGameState = Readonly<{
  gameMode: GameMode;
  score: number;
  combo: number;
  baskets: number;
  ball?: Point;
  hoop: Point;
  obstacles: ObstacleState[];
}>;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPoint = (value: unknown): value is Point =>
  typeof value === 'object' &&
  value !== null &&
  isNumber((value as Point).x) &&
  isNumber((value as Point).y);

const isObstacle = (value: unknown): value is ObstacleState =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ObstacleState).kind === 'string' &&
  (value as ObstacleState).kind in OBSTACLE_TYPES &&
  isPoint((value as ObstacleState).position) &&
  typeof (value as ObstacleState).moving === 'boolean' &&
  isNumber((value as ObstacleState).angle);

const isSavedGameState = (value: unknown): value is SavedGameState =>
  typeof value === 'object' &&
  value !== null &&
  ((value as SavedGameState).gameMode === GameMode.Classic ||
    (value as SavedGameState).gameMode === GameMode.Obstacles) &&
  isNumber((value as SavedGameState).score) &&
  isNumber((value as SavedGameState).combo) &&
  isNumber((value as SavedGameState).baskets) &&
  ((value as SavedGameState).ball === undefined || isPoint((value as SavedGameState).ball)) &&
  isPoint((value as SavedGameState).hoop) &&
  Array.isArray((value as SavedGameState).obstacles) &&
  (value as SavedGameState).obstacles.every(isObstacle);

export const loadGameState = (): SavedGameState | null => {
  const gameState = readJson<unknown>(STORAGE_KEYS.gameState);
  return isSavedGameState(gameState) ? gameState : null;
};

export const saveGameState = (gameState: SavedGameState): void =>
  writeJson(STORAGE_KEYS.gameState, gameState);

export const clearGameState = (): void => removeStorage(STORAGE_KEYS.gameState);
