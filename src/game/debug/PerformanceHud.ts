export class PerformanceHud {
  private readonly element: HTMLPreElement;
  private readonly observer: PerformanceObserver | null;
  private lastReport = performance.now();
  private frames = 0;
  private frameTotal = 0;
  private frameMax = 0;
  private updateTotal = 0;
  private renderTotal = 0;
  private longTasks = 0;
  private longestTask = 0;
  private supportsLongTasks = false;

  constructor() {
    this.element = document.createElement('pre');
    this.element.className = 'performance-hud';
    document.body.append(this.element);
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTasks += 1;
          this.longestTask = Math.max(this.longestTask, entry.duration);
        }
      });
      this.observer.observe({ type: 'longtask', buffered: true });
      this.supportsLongTasks = true;
    } catch {
      this.observer = null;
    }
  }

  record(frame: number, update: number, render: number): void {
    this.frames += 1;
    this.frameTotal += frame;
    this.frameMax = Math.max(this.frameMax, frame);
    this.updateTotal += update;
    this.renderTotal += render;
    const now = performance.now();
    const elapsed = now - this.lastReport;
    if (elapsed < 750) {
      return;
    }
    const averageFrame = this.frameTotal / this.frames;
    const longTasks = this.supportsLongTasks
      ? `${this.longTasks} / ${this.longestTask.toFixed(0)}ms`
      : 'unavailable';
    this.element.textContent = `PERF\n${(1000 / averageFrame).toFixed(0)} FPS  ${averageFrame.toFixed(1)}ms\nworst ${this.frameMax.toFixed(1)}ms\nupdate ${(this.updateTotal / this.frames).toFixed(1)}ms\nrender ${(this.renderTotal / this.frames).toFixed(1)}ms\nlong ${longTasks}`;
    this.lastReport = now;
    this.frames = 0;
    this.frameTotal = 0;
    this.frameMax = 0;
    this.updateTotal = 0;
    this.renderTotal = 0;
    this.longTasks = 0;
    this.longestTask = 0;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.element.remove();
  }
}
