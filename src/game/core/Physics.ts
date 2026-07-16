import { Body, Engine, Events, Sleeping, World } from 'matter-js';
import { BALL, HOOP, WORLD } from './Constants';
import { createBall } from '../entities/Ball';
import { createFloor, createWalls } from '../entities/Floor';
import { Hoop } from '../entities/Hoop';
import { Obstacle, type ObstacleState } from '../entities/Obstacle';
import { ObstacleSpawner } from '../systems/ObstacleSpawner';
import type { Point } from '../Utils';

export type HitKind = 'floor' | 'rim' | 'backboard';

export class Physics {
  readonly engine = Engine.create({ enableSleeping: true });
  readonly ball = createBall(WORLD.ballStartX, WORLD.floorY - 22);
  readonly hoop = new Hoop(this.engine.world, WORLD.hoopStartX, WORLD.hoopStartY);
  readonly obstacles: Obstacle[] = [];
  private readonly obstacleSpawner = new ObstacleSpawner();
  onHit: ((kind: HitKind, speed: number) => void) | null = null;

  constructor() {
    this.engine.gravity.y = WORLD.gravity;
    this.engine.gravity.scale = 0.001;
    World.add(this.engine.world, [createFloor(), ...createWalls(), this.ball]);
    Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const bodies = [pair.bodyA, pair.bodyB];
        if (!bodies.some((body) => body.label === 'ball')) {
          continue;
        }
        const other = bodies.find((body) => body.label !== 'ball');
        if (!other) {
          continue;
        }
        const kind = other.label as HitKind;
        if (kind === 'floor' || kind === 'rim' || kind === 'backboard') {
          this.onHit?.(kind, kind === 'floor' ? Math.abs(this.ball.velocity.y) : this.speed);
        }
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
  isHoopClear(position: Point): boolean {
    const hoop = {
      minX: position.x - HOOP.gap / 2 - 24,
      maxX: position.x + HOOP.gap / 2 + HOOP.boardWidth + 48,
      minY: position.y - HOOP.boardHeight - 24,
      maxY: position.y + 55,
    };
    return this.obstacles.every(
      ({ body }) =>
        body.bounds.max.x < hoop.minX ||
        body.bounds.min.x > hoop.maxX ||
        body.bounds.max.y < hoop.minY ||
        body.bounds.min.y > hoop.maxY,
    );
  }
  step(): void {
    this.obstacles.forEach((obstacle) => obstacle.update(performance.now()));
    Engine.update(this.engine, WORLD.step);
  }
  addObstacle(from: Point, to: Point): void {
    this.obstacleSpawner.spawn(this.engine.world, this.obstacles, from, to);
  }
  restore(hoop: Point, obstacles: ObstacleState[], ball?: Point): void {
    this.hoop.move(this.engine.world, hoop.x, hoop.y);
    if (ball) {
      Body.setPosition(this.ball, ball);
      Body.setVelocity(this.ball, { x: 0, y: 0 });
      Body.setAngularVelocity(this.ball, 0);
      Sleeping.set(this.ball, true);
    }
    obstacles.forEach((obstacle) => {
      this.obstacles.push(
        new Obstacle(
          this.engine.world,
          obstacle.kind,
          obstacle.position,
          obstacle.position,
          obstacle,
        ),
      );
    });
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
