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

const MODE_KEY = 'pocket-basketball-game-mode';
const SCORES_KEY = 'pocket-basketball-high-scores';

export const loadMode = (): GameMode =>
  localStorage.getItem(MODE_KEY) === GameMode.Obstacles ? GameMode.Obstacles : GameMode.Classic;

export const saveMode = (mode: GameMode): void => localStorage.setItem(MODE_KEY, mode);

export const loadHighScores = (): HighScores => {
  try {
    const scores = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '{}') as Partial<HighScores>;
    return {
      classic: scores.classic ?? 0,
      obstacles: scores.obstacles ?? 0,
    };
  } catch {
    return { classic: 0, obstacles: 0 };
  }
};

export const saveHighScore = (mode: GameMode, score: number): number => {
  const scores = loadHighScores();
  scores[mode] = Math.max(scores[mode], score);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  return scores[mode];
};
