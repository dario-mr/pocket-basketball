import type { Point } from './Utils';

export class Input {
  private point: Point = { x: 0, y: 0 };
  private down = false;
  onStart: ((point: Point) => void) | null = null;
  onMove: ((point: Point) => void) | null = null;
  onEnd: ((point: Point) => void) | null = null;

  constructor(target: HTMLCanvasElement, toWorld: (event: PointerEvent) => Point) {
    target.addEventListener('pointerdown', (event) => {
      this.down = true;
      this.point = toWorld(event);
      target.setPointerCapture(event.pointerId);
      this.onStart?.(this.point);
    });
    target.addEventListener('pointermove', (event) => {
      this.point = toWorld(event);
      if (this.down) this.onMove?.(this.point);
    });
    target.addEventListener('pointerup', (event) => this.end(event, toWorld));
    target.addEventListener('pointercancel', (event) => this.end(event, toWorld));
  }

  private end(event: PointerEvent, toWorld: (event: PointerEvent) => Point): void {
    if (!this.down) return;
    this.down = false;
    this.point = toWorld(event);
    this.onEnd?.(this.point);
  }
}
