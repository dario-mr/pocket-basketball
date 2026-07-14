export class Score {
  score = 0;
  combo = 0;
  highScore = Number.parseInt(localStorage.getItem('pocket-basketball-high-score') ?? '0', 10) || 0;

  basket(swish: boolean): number {
    this.combo += 1;
    const points = 1 + (swish ? 1 : 0) + Math.max(0, this.combo - 1);
    this.score += points;
    this.highScore = Math.max(this.highScore, this.score);
    localStorage.setItem('pocket-basketball-high-score', String(this.highScore));
    return points;
  }
  miss(): void {
    this.combo = 0;
  }
}
