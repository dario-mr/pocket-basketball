import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { configureWorld, WORLD } = await vite.ssrLoadModule('/src/game/core/Constants.ts');
const { HoopProgression } = await vite.ssrLoadModule('/src/game/systems/HoopProgression.ts');

after(() => vite.close());

const withRandom = (value, run) => {
  const original = Math.random;
  Math.random = () => value;
  try {
    return run();
  } finally {
    Math.random = original;
  }
};

const progressionFor = (position, hoop) =>
  new HoopProgression({
    position,
    hoop,
    isHoopClear: () => true,
  });

test('keeps high-score portrait hoop targets away from the screen edge', () => {
  configureWorld(390, 844);
  const progression = progressionFor(
    { x: WORLD.hoopMinX, y: WORLD.floorY },
    { x: WORLD.hoopMaxX, y: WORLD.hoopStartY },
  );

  withRandom(0, () => progression.start(100, false));

  assert.ok(progression.move.to.x > WORLD.hoopMinX);
  assert.ok(progression.move.to.x < WORLD.hoopMaxX);
  assert.ok(progression.move.to.y > WORLD.hoopMinY);
});

test('moves after a basket even when the first target matches the current hoop', () => {
  configureWorld(390, 844);
  const progression = progressionFor(
    { x: WORLD.hoopMinX, y: WORLD.floorY },
    { x: 277.5, y: WORLD.hoopMinY },
  );

  withRandom(0, () => progression.start(100, false));

  assert.ok(Math.hypot(progression.move.to.x - 277.5, progression.move.to.y - WORLD.hoopMinY) >= 36);
});
