import { BALL, WORLD } from '../Constants';
import type { Point } from '../Utils';

export const trajectory = (start: Point, pull: Point): Point[] => {
  const points: Point[] = [];
  const velocity = { x: -pull.x * BALL.launchScale, y: -pull.y * BALL.launchScale };
  const position = { ...start };
  const gravityPerStep = WORLD.gravity * 0.001 * WORLD.step ** 2;
  const airDrag = 1 - BALL.frictionAir;
  for (let step = 0; step < 120; step += 1) {
    velocity.x *= airDrag;
    velocity.y = velocity.y * airDrag + gravityPerStep;
    position.x += velocity.x;
    position.y += velocity.y;
    if (step % 3 === 0) points.push({ ...position });
  }
  return points;
};
