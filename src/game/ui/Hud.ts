import { GAME_MODES, type GameMode } from '../state/Modes';

const HUD_INSET = 14;

export class Hud {
  message = '';
  private messageUntil = 0;

  show(message: string, duration = 1100): void {
    this.message = message;
    this.messageUntil = performance.now() + duration;
  }

  draw(
    context: CanvasRenderingContext2D,
    score: number,
    highScore: number,
    combo: number,
    mode: GameMode,
  ): void {
    const scale = context.canvas.width / context.canvas.clientWidth;
    context.save();
    context.fillStyle = '#fff8e8';
    context.font = `700 ${20 * scale}px system-ui, sans-serif`;
    context.textBaseline = 'top';
    context.fillText(`SCORE ${score}`, HUD_INSET * scale, 12 * scale);

    context.font = `500 ${16 * scale}px system-ui, sans-serif`;
    context.globalAlpha = 0.75;
    context.fillText(`BEST ${highScore}`, HUD_INSET * scale, 46 * scale);
    context.globalAlpha = 0.48;
    context.font = `600 ${12 * scale}px system-ui, sans-serif`;
    context.fillText(
      GAME_MODES.find((definition) => definition.id === mode)?.title.toUpperCase() ?? '',
      HUD_INSET * scale,
      69 * scale,
    );

    if (combo > 1) {
      context.globalAlpha = 1;
      context.fillStyle = '#ffc857';
      context.font = `600 ${16 * scale}px system-ui, sans-serif`;
      context.fillText(`COMBO ×${combo}`, HUD_INSET * scale, 91 * scale);
    }

    if (performance.now() < this.messageUntil) {
      context.globalAlpha = Math.min(1, (this.messageUntil - performance.now()) / 180);
      context.textAlign = 'center';
      context.font = `800 ${20 * scale}px system-ui, sans-serif`;
      context.fillStyle = '#fff8e8';
      context.fillText(this.message, context.canvas.width / 2, 30 * scale);
    }

    context.restore();
  }
}
