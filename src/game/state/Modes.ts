import { readJson, readStorage, STORAGE_KEYS, writeJson, writeStorage } from './Storage';

export enum GameMode {
  Classic = 'classic',
  Obstacles = 'obstacles',
}

export type GameModeDefinition = Readonly<{
  id: GameMode;
  title: string;
  description: string;
}>;

export const GAME_MODES: readonly GameModeDefinition[] = [
  { id: GameMode.Classic, title: 'Classic', description: 'Simple endless basketball.' },
  {
    id: GameMode.Obstacles,
    title: 'Obstacles',
    description: 'A new obstacle appears after every basket.',
  },
];

export type HighScores = Record<GameMode, number>;

export const loadMode = (): GameMode =>
  readStorage(STORAGE_KEYS.gameMode) === GameMode.Obstacles ? GameMode.Obstacles : GameMode.Classic;

export const saveMode = (mode: GameMode): void => writeStorage(STORAGE_KEYS.gameMode, mode);

export const loadHighScores = (): HighScores => {
  const scores = readJson<Partial<HighScores>>(STORAGE_KEYS.highScores) ?? {};
  return {
    classic: scores.classic ?? 0,
    obstacles: scores.obstacles ?? 0,
  };
};

export const saveHighScore = (mode: GameMode, score: number): number => {
  const scores = loadHighScores();
  scores[mode] = Math.max(scores[mode], score);
  writeJson(STORAGE_KEYS.highScores, scores);
  return scores[mode];
};
