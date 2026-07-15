import { Body, Engine, Events, Sleeping, World } from 'matter-js';
import { BALL, WORLD } from './Constants';
import { createBall } from './entities/Ball';
import { createFloor, createWalls } from './entities/Floor';
import { Hoop } from './entities/Hoop';
import type { Point } from './Utils';

export type HitKind = 'floor' | 'rim' | 'backboard';

export class Physics {
  readonly engine = Engine.create({ enableSleeping: true });
  readonly ball = createBall(220, WORLD.floorY - 22);
  readonly hoop = new Hoop(this.engine.world, 700, 200);
  onHit: ((kind: HitKind, speed: number) => void) | null = null;

  constructor() {
    this.engine.gravity.y = WORLD.gravity;
    this.engine.gravity.scale = 0.001;
    World.add(this.engine.world, [createFloor(), ...createWalls(), this.ball]);
    Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const bodies = [pair.bodyA, pair.bodyB];
        if (!bodies.some((body) => body.label === 'ball')) continue;
        const other = bodies.find((body) => body.label !== 'ball');
        if (!other) continue;
        const kind = other.label as HitKind;
        if (kind === 'floor' || kind === 'rim' || kind === 'backboard')
          this.onHit?.(kind, this.speed);
      }
    });
  }

  get speed(): number {
    return Math.hypot(this.ball.velocity.x, this.ball.velocity.y);
  }
  get position(): Point {
    return this.ball.position;
  }
  get isSettled(): boolean {
    return this.ball.isSleeping || this.speed < 0.16;
  }
  step(): void {
    Engine.update(this.engine, WORLD.step);
  }
  wake(): void {
    Sleeping.set(this.ball, false);
  }
  launch(pull: Point): void {
    this.wake();
    Body.setVelocity(this.ball, { x: -pull.x * 0.115, y: -pull.y * 0.115 });
    Body.setAngularVelocity(this.ball, pull.x * BALL.spinScale);
  }
}
