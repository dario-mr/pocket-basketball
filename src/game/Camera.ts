import { random } from './Utils';

export class Camera {
  x = 0;
  y = 0;
  private shake = 0;
  hit(amount: number): void {
    this.shake = Math.max(this.shake, amount);
  }
  update(delta: number): void {
    this.shake = Math.max(0, this.shake - delta * 0.025);
    this.x = random(-this.shake, this.shake);
    this.y = random(-this.shake, this.shake);
  }
}
