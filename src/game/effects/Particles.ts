import { random, type Point } from '../Utils';

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
export class Particles {
  readonly items: Particle[] = [];
  burst(point: Point, color: string, amount: number): void {
    for (let i = 0; i < amount; i += 1)
      this.items.push({ ...point, vx: random(-2, 2), vy: random(-3, -0.5), life: 1, color });
  }
  update(delta: number): void {
    for (const particle of this.items) {
      particle.x += particle.vx * delta * 0.06;
      particle.y += particle.vy * delta * 0.06;
      particle.vy += delta * 0.001;
      particle.life -= delta * 0.003;
    }
    while (this.items[0]?.life <= 0) this.items.shift();
  }
}
