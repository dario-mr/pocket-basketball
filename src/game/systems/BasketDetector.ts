import type { Body } from 'matter-js';
import { BALL, HOOP } from '../core/Constants';
import type { Hoop } from '../entities/Hoop';

export class BasketDetector {
  private passedAboveRim = false;
  private scoredThisShot = false;

  get hasScored(): boolean {
    return this.scoredThisShot;
  }

  reset(): void {
    this.passedAboveRim = false;
    this.scoredThisShot = false;
  }

  detect(ball: Body, hoop: Hoop): boolean {
    if (this.scoredThisShot) return false;
    if (ball.position.y < hoop.y) this.passedAboveRim = true;
    const belowRim = ball.position.y >= hoop.y + BALL.radius && ball.velocity.y > 0;
    const insideRim = Math.abs(ball.position.x - hoop.x) < HOOP.gap / 2 - HOOP.scoringInset;
    if (!this.passedAboveRim || !belowRim || !insideRim) return false;
    this.scoredThisShot = true;
    return true;
  }
}
