import type { Point } from '../Utils';

type Ghost = Point & { life: number };
export class BallTrail {
  readonly ghosts: Ghost[] = [];
  add(point: Point, fast: boolean): void {
    if (fast && this.ghosts.length < 18) this.ghosts.push({ ...point, life: 1 });
  }
  update(delta: number): void {
    for (const ghost of this.ghosts) ghost.life -= delta * 0.003;
    while (this.ghosts[0]?.life <= 0) this.ghosts.shift();
  }
}
