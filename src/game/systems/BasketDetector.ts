import type { Body } from 'matter-js';
import { HOOP } from '../core/Constants';
import type { Hoop } from '../entities/Hoop';

export class BasketDetector {
  private passedAboveRim = false;
  private scoredThisShot = false;
  private previousY = 0;

  get hasScored(): boolean {
    return this.scoredThisShot;
  }

  reset(ballY: number): void {
    this.passedAboveRim = false;
    this.scoredThisShot = false;
    this.previousY = ballY;
  }

  detect(ball: Body, hoop: Hoop): boolean {
    if (this.scoredThisShot) return false;
    if (ball.position.y < hoop.y) this.passedAboveRim = true;
    const scoreLine = hoop.y + HOOP.scoringDepth;
    const crossedDown =
      this.previousY < scoreLine && ball.position.y >= scoreLine && ball.velocity.y > 0;
    const insideRim = Math.abs(ball.position.x - hoop.x) < HOOP.gap / 2 - HOOP.scoringInset;
    this.previousY = ball.position.y;
    if (!this.passedAboveRim || !crossedDown || !insideRim) return false;
    this.scoredThisShot = true;
    return true;
  }
}
