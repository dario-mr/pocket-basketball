import { WORLD } from '../Constants';
import type { Physics } from '../Physics';
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
    if (!this.move) return false;
    const amount = clamp((performance.now() - this.move.started) / 550, 0, 1);
    const eased = 1 - (1 - amount) ** 3;
    this.physics.hoop.move(
      this.physics.engine.world,
      lerp(this.move.from.x, this.move.to.x, eased),
      lerp(this.move.from.y, this.move.to.y, eased),
    );
    if (amount !== 1) return false;
    this.move = null;
    return true;
  }

  private nextTarget(baskets: number): Point {
    const fallback = this.randomTarget(baskets);
    if (this.physics.isHoopClear(fallback)) return fallback;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const target = this.randomTarget(baskets);
      if (this.physics.isHoopClear(target)) return target;
    }
    let alternative: Point | null = null;
    for (let x = WORLD.hoopMinX; x <= WORLD.hoopMaxX; x += 60) {
      for (let y = WORLD.hoopMinY; y <= WORLD.hoopMaxY; y += 40) {
        const target = { x, y };
        if (
          this.physics.isHoopClear(target) &&
          (!alternative ||
            Math.hypot(target.x - fallback.x, target.y - fallback.y) <
              Math.hypot(alternative.x - fallback.x, alternative.y - fallback.y))
        )
          alternative = target;
      }
    }
    return alternative ?? fallback;
  }

  private randomTarget(baskets: number): Point {
    const distanceBonus = Math.floor(baskets / 5) * 38;
    const horizontal = WORLD.hoopDistance + distanceBonus + random(-55, 60);
    const side = this.physics.position.x < WORLD.width / 2 ? 1 : -1;
    return {
      x: clamp(this.physics.position.x + side * horizontal, WORLD.hoopMinX, WORLD.hoopMaxX),
      y: clamp(
        WORLD.hoopStartY - Math.floor(baskets / 5) * 10 + random(-35, 35),
        WORLD.hoopMinY,
        WORLD.hoopMaxY,
      ),
    };
  }
}
