import { GameMode, loadHighScores, saveHighScore } from './Modes';

export class Score {
  score = 0;
  combo = 0;
  highScore: number;

  constructor(private readonly mode: GameMode) {
    this.highScore = loadHighScores()[mode];
  }

  basket(swish: boolean): number {
    this.combo += 1;
    const points = 1 + (swish ? 1 : 0) + Math.max(0, this.combo - 1);
    this.score += points;
    this.highScore = saveHighScore(this.mode, this.score);
    return points;
  }
  restore(score: number, combo: number): void {
    this.score = score;
    this.combo = combo;
    this.highScore = saveHighScore(this.mode, score);
  }
  miss(): void {
    this.combo = 0;
  }
}
