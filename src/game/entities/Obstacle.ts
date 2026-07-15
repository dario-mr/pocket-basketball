import { Bodies, Body, World } from 'matter-js';
import { WORLD } from '../Constants';
import { clamp, lerp, random, type Point } from '../Utils';

export const OBSTACLE_TYPES = {
  horizontal: { weight: 5, color: '#f2b95b' },
  vertical: { weight: 5, color: '#62c9a5' },
  diagonal: { weight: 15, color: '#ad7de7' },
  paddle: { weight: 25, color: '#e96a77' },
  dot: { weight: 50, color: '#4fa7e8' },
} as const;

export type ObstacleKind = keyof typeof OBSTACLE_TYPES;

export class Obstacle {
  readonly kind: ObstacleKind;
  readonly body: Body;
  readonly moving: boolean;
  private readonly origin: Point;
  private readonly phase = random(0, Math.PI * 2);

  constructor(world: World, kind: ObstacleKind, from: Point, to: Point) {
    this.kind = kind;
    const x = lerp(from.x, to.x, random(0.35, 0.65)) + random(-45, 45);
    const y = clamp(
      lerp(from.y, to.y, random(0.55, 0.85)) + random(-60, 60),
      65,
      WORLD.floorY - 155,
    );
    this.origin = { x, y };
    this.moving = kind === 'paddle' || (kind !== 'dot' && Math.random() < 0.5);
    this.body =
      kind === 'dot'
        ? Bodies.circle(x, y, 12, { isStatic: true, label: 'obstacle', restitution: 0.8 })
        : Bodies.rectangle(
            x,
            y,
            kind === 'vertical' ? 13 : kind === 'paddle' ? 92 : 74,
            kind === 'vertical' ? 74 : 13,
            {
              isStatic: true,
              label: 'obstacle',
              restitution: 0.8,
            },
          );
    if (kind === 'diagonal') Body.setAngle(this.body, Math.PI / 4);
    World.add(world, this.body);
  }

  get color(): string {
    return OBSTACLE_TYPES[this.kind].color;
  }

  update(time: number): void {
    if (this.kind === 'paddle')
      Body.setAngle(this.body, Math.sin(time * 0.004 + this.phase) * 1.15);
    if (!this.moving || this.kind === 'paddle') return;
    if (this.kind === 'horizontal')
      Body.setPosition(this.body, {
        x: this.origin.x + Math.sin(time * 0.003 + this.phase) * 55,
        y: this.origin.y,
      });
    if (this.kind === 'vertical')
      Body.setPosition(this.body, {
        x: this.origin.x,
        y: this.origin.y + Math.sin(time * 0.003 + this.phase) * 45,
      });
    if (this.kind === 'diagonal') {
      const distance = Math.sin(time * 0.003 + this.phase) * 42;
      Body.setPosition(this.body, { x: this.origin.x + distance, y: this.origin.y + distance });
    }
  }
}
