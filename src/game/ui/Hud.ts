export class Hud {
  message = '';
  private messageUntil = 0;

  show(message: string, duration = 1100): void {
    this.message = message;
    this.messageUntil = performance.now() + duration;
  }

  draw(context: CanvasRenderingContext2D, score: number, highScore: number, combo: number): void {
    context.save();
    context.fillStyle = '#fff8e8';
    context.font = '700 22px system-ui, sans-serif';
    context.textBaseline = 'top';
    context.fillText(`SCORE ${score}`, 24, 22);

    context.font = '500 18px system-ui, sans-serif';
    context.globalAlpha = 0.75;
    context.fillText(`BEST ${highScore}`, 24, 56);

    if (combo > 1) {
      context.globalAlpha = 1;
      context.fillStyle = '#ffc857';
      context.font = '600 18px system-ui, sans-serif';
      context.fillText(`COMBO ×${combo}`, 24, 81);
    }

    if (performance.now() < this.messageUntil) {
      context.globalAlpha = Math.min(1, (this.messageUntil - performance.now()) / 180);
      context.textAlign = 'center';
      context.font = '800 22px system-ui, sans-serif';
      context.fillStyle = '#fff8e8';
      context.fillText(this.message, context.canvas.width / 2, 30);
    }

    context.restore();
  }
}
