import type { Point } from '../Utils';

export class Input {
  private point: Point = { x: 0, y: 0 };
  private down = false;
  onStart: ((point: Point) => void) | null = null;
  onMove: ((point: Point) => void) | null = null;
  onEnd: ((point: Point) => void) | null = null;

  private readonly start = (event: PointerEvent): void => {
    this.down = true;
    this.point = this.toWorld(event);
    this.target.setPointerCapture(event.pointerId);
    this.onStart?.(this.point);
  };
  private readonly move = (event: PointerEvent): void => {
    this.point = this.toWorld(event);
    if (this.down) {
      this.onMove?.(this.point);
    }
  };
  private readonly end = (event: PointerEvent): void => {
    if (!this.down) {
      return;
    }
    this.down = false;
    this.point = this.toWorld(event);
    this.onEnd?.(this.point);
  };

  constructor(
    private readonly target: HTMLCanvasElement,
    private readonly toWorld: (event: PointerEvent) => Point,
  ) {
    target.addEventListener('pointerdown', this.start);
    target.addEventListener('pointermove', this.move);
    target.addEventListener('pointerup', this.end);
    target.addEventListener('pointercancel', this.end);
  }

  destroy(): void {
    this.target.removeEventListener('pointerdown', this.start);
    this.target.removeEventListener('pointermove', this.move);
    this.target.removeEventListener('pointerup', this.end);
    this.target.removeEventListener('pointercancel', this.end);
  }
}
