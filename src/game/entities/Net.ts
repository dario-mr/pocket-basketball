export class Net {
  squash = 0;
  update(delta: number): void {
    this.squash = Math.max(0, this.squash - delta * 0.004);
  }
  hit(): void {
    this.squash = 1;
  }
}
