import { Bodies, Body } from 'matter-js';
import { WORLD } from '../Constants';

export const createFloor = (): Body =>
  Bodies.rectangle(WORLD.width / 2, WORLD.floorY + 18, WORLD.width + 100, 36, {
    isStatic: true,
    label: 'floor',
    friction: 0.75,
    restitution: 0.48,
  });

export const createWalls = (): Body[] =>
  [-18, WORLD.width + 18].map((x) =>
    Bodies.rectangle(x, WORLD.height / 2, 36, WORLD.height * 4, {
      isStatic: true,
      label: 'wall',
      restitution: 0.78,
      friction: 0,
    }),
  );
