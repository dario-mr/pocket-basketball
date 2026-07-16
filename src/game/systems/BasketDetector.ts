import type { Body } from 'matter-js';
import { HOOP } from '../core/Constants';
import type { Hoop } from '../entities/Hoop';
import type { Point } from '../Utils';

export class BasketDetector {
  private enteredRim = false;
  private scoredThisShot = false;
  private previousX = 0;
  private previousY = 0;

  get hasScored(): boolean {
    return this.scoredThisShot;
  }

  reset(ballPosition: Point): void {
    this.enteredRim = false;
    this.scoredThisShot = false;
    this.previousX = ballPosition.x;
    this.previousY = ballPosition.y;
  }

  detect(ball: Body, hoop: Hoop): boolean {
    if (this.scoredThisShot) {
      return false;
    }
    const crossedRimDown = this.previousY < hoop.y && ball.position.y >= hoop.y;
    if (crossedRimDown) {
      const crossingX =
        this.previousX +
        ((ball.position.x - this.previousX) * (hoop.y - this.previousY)) /
          (ball.position.y - this.previousY);
      this.enteredRim = Math.abs(crossingX - hoop.x) < HOOP.gap / 2 - HOOP.scoringInset;
    }
    const scoreLine = hoop.y + HOOP.scoringDepth;
    const crossedDown = this.previousY < scoreLine && ball.position.y >= scoreLine;
    this.previousX = ball.position.x;
    this.previousY = ball.position.y;
    if (!this.enteredRim || !crossedDown) {
      return false;
    }
    this.scoredThisShot = true;
    return true;
  }
}
