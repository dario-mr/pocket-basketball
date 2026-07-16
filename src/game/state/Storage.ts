// Browser storage shared by mode, score, and game-state persistence.
export const STORAGE_KEYS = {
  gameMode: 'gameMode',
  highScores: 'highScores',
  gameState: 'gameState',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const readStorage = (key: StorageKey): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: StorageKey, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
};

export const removeStorage = (key: StorageKey): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
};

export const readJson = <Value>(key: StorageKey): Value | null => {
  const value = readStorage(key);
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as Value;
  } catch {
    return null;
  }
};

export const writeJson = (key: StorageKey, value: unknown): void =>
  writeStorage(key, JSON.stringify(value));
