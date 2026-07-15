import type { World } from 'matter-js';
import { OBSTACLE_TYPES, Obstacle, type ObstacleKind } from '../entities/Obstacle';
import type { Point } from '../Utils';

const obstacleKinds = Object.keys(OBSTACLE_TYPES) as ObstacleKind[];

export class ObstacleSpawner {
  private recentKinds: ObstacleKind[] = [];

  spawn(world: World, obstacles: Obstacle[], from: Point, to: Point): void {
    const kind = this.nextKind();
    obstacles.push(new Obstacle(world, kind, from, to));
    this.recentKinds = [...this.recentKinds.slice(-2), kind];
  }

  private nextKind(): ObstacleKind {
    const weights = obstacleKinds.map((kind) => {
      let weight = OBSTACLE_TYPES[kind].weight;
      if (this.recentKinds.at(-1) === kind) weight *= 0.15;
      if (this.recentKinds.filter((recent) => recent === kind).length >= 2) weight *= 0.25;
      return weight;
    });
    let pick = Math.random() * weights.reduce((total, weight) => total + weight, 0);
    for (const [index, kind] of obstacleKinds.entries()) {
      pick -= weights[index];
      if (pick < 0) return kind;
    }
    return obstacleKinds.at(-1)!;
  }
}
