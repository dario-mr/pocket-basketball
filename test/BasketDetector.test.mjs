import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { BasketDetector } = await vite.ssrLoadModule('/src/game/systems/BasketDetector.ts');

after(() => vite.close());

const move = (detector, ball, hoop, x, y, velocityY) => {
  ball.position = { x, y };
  ball.velocity = { y: velocityY };
  return detector.detect(ball, hoop);
};

test('scores a fast rim bounce after the ball clears the hoop', () => {
  const detector = new BasketDetector();
  const hoop = { x: 700, y: 200 };
  const ball = { position: { x: 600, y: 300 }, velocity: { y: 0 } };
  detector.reset(ball.position);

  assert.equal(move(detector, ball, hoop, 670, 190, -10), false);
  assert.equal(move(detector, ball, hoop, 675, 205, 10), false);
  assert.equal(move(detector, ball, hoop, 670, 235, 10), false);
  assert.equal(move(detector, ball, hoop, 660, 245, 10), true);
});

test('does not score when the ball misses the rim opening', () => {
  const detector = new BasketDetector();
  const hoop = { x: 700, y: 200 };
  const ball = { position: { x: 600, y: 300 }, velocity: { y: 0 } };
  detector.reset(ball.position);

  assert.equal(move(detector, ball, hoop, 740, 190, -10), false);
  assert.equal(move(detector, ball, hoop, 740, 205, 10), false);
  assert.equal(move(detector, ball, hoop, 700, 245, 10), false);
});
