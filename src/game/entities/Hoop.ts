import { Bodies, Body, Composite, World } from 'matter-js';
import { HOOP } from '../Constants';

export class Hoop {
  x: number;
  y: number;
  readonly parts: Body[];
  vibration = 0;

  constructor(world: World, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.parts = [
      Bodies.rectangle(x + HOOP.gap / 2 + 18, y - 52, HOOP.boardWidth, HOOP.boardHeight, {
        isStatic: true,
        label: 'backboard',
        restitution: 0.55,
      }),
      Bodies.circle(x - HOOP.gap / 2, y, HOOP.radius, {
        isStatic: true,
        label: 'rim',
        restitution: 0.78,
        friction: 0,
      }),
      Bodies.circle(x + HOOP.gap / 2, y, HOOP.radius, {
        isStatic: true,
        label: 'rim',
        restitution: 0.78,
        friction: 0,
      }),
    ];
    Composite.add(world, this.parts);
  }

  move(world: World, x: number, y: number): void {
    Composite.remove(world, this.parts);
    this.x = x;
    this.y = y;
    const [board, left, right] = this.parts;
    Body.setPosition(board, { x: x + HOOP.gap / 2 + 18, y: y - 52 });
    Body.setPosition(left, { x: x - HOOP.gap / 2, y });
    Body.setPosition(right, { x: x + HOOP.gap / 2, y });
    Composite.add(world, this.parts);
  }
}
