import { HOOP, WORLD } from '../core/Constants';
import type { Physics } from '../core/Physics';
import { clamp, lerp, random, type Point } from '../Utils';

type Move = Readonly<{ from: Point; to: Point; started: number }>;

export class HoopProgression {
  private move: Move | null = null;

  constructor(private readonly physics: Physics) {}

  get isMoving(): boolean {
    return this.move !== null;
  }

  spawnObstacle(baskets: number): void {
    this.physics.addObstacle(this.physics.position, this.nextTarget(baskets));
  }

  start(baskets: number, spawnObstacle: boolean): void {
    let target = this.nextTarget(baskets);
    if (spawnObstacle) {
      this.physics.addObstacle(this.physics.position, target);
      target = this.nextTarget(baskets);
    }
    this.move = {
      from: { x: this.physics.hoop.x, y: this.physics.hoop.y },
      to: target,
      started: performance.now(),
    };
  }

  update(): boolean {
    if (!this.move) {
      return false;
    }
    const amount = clamp((performance.now() - this.move.started) / 550, 0, 1);
    const eased = 1 - (1 - amount) ** 3;
    this.physics.hoop.move(
      this.physics.engine.world,
      lerp(this.move.from.x, this.move.to.x, eased),
      lerp(this.move.from.y, this.move.to.y, eased),
    );
    if (amount !== 1) {
      return false;
    }
    this.move = null;
    return true;
  }

  private nextTarget(baskets: number): Point {
    const fallback = this.randomTarget(baskets);
    if (this.isNewClearTarget(fallback)) {
      return fallback;
    }
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const target = this.randomTarget(baskets);
      if (this.isNewClearTarget(target)) {
        return target;
      }
    }
    let alternative: Point | null = null;
    for (let x = WORLD.hoopMinX; x <= WORLD.hoopMaxX; x += 60) {
      for (let y = WORLD.hoopMinY; y <= WORLD.hoopMaxY; y += 40) {
        const target = { x, y };
        if (
          this.isNewClearTarget(target) &&
          (!alternative ||
            Math.hypot(target.x - fallback.x, target.y - fallback.y) <
              Math.hypot(alternative.x - fallback.x, alternative.y - fallback.y))
        ) {
          alternative = target;
        }
      }
    }
    return alternative ?? fallback;
  }

  private isNewClearTarget(target: Point): boolean {
    return (
      this.physics.isHoopClear(target) &&
      Math.hypot(target.x - this.physics.hoop.x, target.y - this.physics.hoop.y) >= HOOP.gap / 2
    );
  }

  private randomTarget(baskets: number): Point {
    const difficulty = Math.floor(baskets / 5);
    const side = this.physics.position.x < WORLD.width / 2 ? 1 : -1;
    const maxHorizontal =
      side === 1
        ? WORLD.hoopMaxX - this.physics.position.x
        : this.physics.position.x - WORLD.hoopMinX;
    const desiredHorizontal = WORLD.hoopDistance + Math.min(difficulty * 38, WORLD.hoopDistance / 2);
    const minHorizontal = Math.min(desiredHorizontal - 55, maxHorizontal - 30);
    const horizontal = random(minHorizontal, Math.max(minHorizontal, Math.min(desiredHorizontal + 60, maxHorizontal)));
    const y = clamp(
      WORLD.hoopStartY - difficulty * 10,
      WORLD.hoopMinY + 40,
      WORLD.hoopMaxY - 40,
    );
    return {
      x: clamp(this.physics.position.x + side * horizontal, WORLD.hoopMinX, WORLD.hoopMaxX),
      y: random(y - 35, y + 35),
    };
  }
}
