import { BALL, HOOP, WORLD } from './Constants';
import { Audio } from './Audio';
import { Camera } from './Camera';
import { Input } from './Input';
import { GameMode } from './Modes';
import { Physics, type HitKind } from './Physics';
import { Renderer } from './Renderer';
import { Score } from './Score';
import type { SavedGameState } from './GameState';
import { Particles } from './effects/Particles';
import { trajectory } from './effects/Trajectory';
import { Net } from './entities/Net';
import { HoopProgression } from './systems/HoopProgression';
import { Hud } from './ui/Hud';
import type { Point } from './Utils';

type State = 'idle' | 'dragging' | 'flying' | 'rolling';

export class Game {
  private readonly renderer: Renderer;
  private readonly physics = new Physics();
  private readonly hoops = new HoopProgression(this.physics);
  private readonly input: Input;
  private readonly camera = new Camera();
  private readonly audio = new Audio();
  private readonly score: Score;
  private readonly particles = new Particles();
  private readonly net = new Net();
  private readonly hud = new Hud();
  private state: State = 'idle';
  private dragStart: Point = { x: 0, y: 0 };
  private pull: Point = { x: 0, y: 0 };
  private previousY = this.physics.position.y;
  private rimHit = false;
  private scoredThisShot = false;
  private baskets = 0;
  private accumulator = 0;
  private lastTime = performance.now();
  private animationFrame = 0;
  private paused = false;
  private destroyed = false;
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onPause();
    }
    if (!event.repeat && event.key.toLowerCase() === 'o' && this.mode === GameMode.Obstacles)
      this.hoops.spawnObstacle(this.baskets);
  };

  constructor(
    canvas: HTMLCanvasElement,
    private readonly mode: GameMode,
    private readonly onPause: () => void,
    restored?: SavedGameState,
  ) {
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas, (event) => this.renderer.pointFromEvent(event));
    this.score = new Score(mode);
    this.input.onStart = (point) => this.startDrag(point);
    this.input.onMove = (point) => this.drag(point);
    this.input.onEnd = () => this.release();
    this.physics.onHit = (kind, speed) => this.hit(kind, speed);
    if (restored) {
      this.baskets = restored.baskets;
      this.score.restore(restored.score, restored.combo);
      this.physics.restore(restored.hoop, restored.obstacles, restored.ball);
    }
    window.addEventListener('keydown', this.onKeyDown);
    this.animationFrame = requestAnimationFrame((time) => this.frame(time));
  }

  pause(): void {
    this.paused = true;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  resume(): void {
    this.paused = false;
    this.lastTime = performance.now();
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    window.removeEventListener('keydown', this.onKeyDown);
  }

  snapshot(): SavedGameState {
    const ball =
      this.state === 'idle' &&
      this.physics.isSettled &&
      this.physics.position.y >= WORLD.floorY - BALL.radius - 4
        ? { x: this.physics.position.x, y: this.physics.position.y }
        : undefined;
    return {
      gameMode: this.mode,
      score: this.score.score,
      combo: this.score.combo,
      baskets: this.baskets,
      ...(ball && { ball }),
      hoop: { x: this.physics.hoop.x, y: this.physics.hoop.y },
      obstacles: this.physics.obstacles.map((obstacle) => obstacle.snapshot()),
    };
  }

  private startDrag(point: Point): void {
    if (this.paused || this.state !== 'idle' || this.hoops.isMoving) return;
    this.state = 'dragging';
    this.dragStart = point;
    this.pull = { x: 0, y: 0 };
  }

  private drag(point: Point): void {
    if (this.state !== 'dragging') return;
    const x = point.x - this.dragStart.x;
    const y = point.y - this.dragStart.y;
    const length = Math.hypot(x, y);
    const scale = length > BALL.maxPull ? BALL.maxPull / length : 1;
    this.pull = { x: x * scale, y: y * scale };
  }

  private release(): void {
    if (this.state !== 'dragging') return;
    if (Math.hypot(this.pull.x, this.pull.y) < 10) {
      this.state = 'idle';
      return;
    }
    this.physics.launch(this.pull);
    this.state = 'flying';
    this.rimHit = false;
    this.scoredThisShot = false;
    this.previousY = this.physics.position.y;
  }

  private hit(kind: HitKind, speed: number): void {
    if (kind === 'rim') {
      this.rimHit = true;
      this.physics.hoop.vibration = Math.min(3, speed * 0.45);
      this.audio.play('rim');
      this.particles.burst(this.physics.position, '#f6c3a0', 4);
      if (speed > 5) this.camera.hit(2.2);
    }
    if (kind === 'floor') {
      this.audio.play('bounce');
      this.particles.burst({ x: this.physics.position.x, y: WORLD.floorY }, '#dbc49f', 5);
      if (speed > 8) this.camera.hit(1.8);
    }
    if (kind === 'backboard') {
      this.audio.play('board');
      this.physics.hoop.vibration = Math.min(1.5, speed * 0.2);
    }
  }

  private detectBasket(): void {
    const ball = this.physics.ball;
    const hoop = this.physics.hoop;
    const crossedDown = this.previousY < hoop.y && ball.position.y >= hoop.y && ball.velocity.y > 0;
    const insideRim =
      ball.position.x > hoop.x - HOOP.gap / 2 + 3 && ball.position.x < hoop.x + HOOP.gap / 2 - 3;
    if (!this.scoredThisShot && crossedDown && insideRim) {
      this.scoredThisShot = true;
      this.baskets += 1;
      const swish = !this.rimHit;
      const points = this.score.basket(swish);
      this.net.hit();
      this.particles.burst({ x: hoop.x, y: hoop.y + 15 }, '#fff8e8', swish ? 16 : 9);
      this.audio.play(swish ? 'perfect' : this.score.combo > 1 ? 'combo' : 'score');
      this.hud.show(swish ? `SWISH +${points}` : `+${points}`);
      if (swish) {
        this.audio.play('swish');
      }
    }
    this.previousY = ball.position.y;
  }

  private update(delta: number): void {
    this.accumulator += delta;
    while (this.accumulator >= WORLD.step) {
      this.physics.step();
      this.accumulator -= WORLD.step;
      if (this.state === 'flying' || this.state === 'rolling') this.detectBasket();
    }
    this.particles.update(delta);
    this.net.update(delta);
    this.camera.update(delta);
    this.physics.hoop.vibration = Math.max(0, this.physics.hoop.vibration - delta * 0.006);
    if (
      this.state === 'flying' &&
      this.physics.position.y > WORLD.floorY - BALL.radius - 4 &&
      this.physics.speed < 3
    )
      this.state = 'rolling';
    if (
      (this.state === 'flying' || this.state === 'rolling') &&
      this.physics.isSettled &&
      !this.hoops.isMoving
    ) {
      if (this.scoredThisShot) this.hoops.start(this.baskets, this.mode === GameMode.Obstacles);
      else this.score.miss();
      this.state = this.hoops.isMoving ? 'rolling' : 'idle';
    }
    if (this.hoops.update()) this.state = 'idle';
  }

  private frame(time: number): void {
    if (this.destroyed) return;
    const delta = Math.min(40, time - this.lastTime);
    this.lastTime = time;
    if (!this.paused) this.update(delta);
    this.renderer.render({
      ball: this.physics.ball,
      hoop: this.physics.hoop,
      obstacles: this.physics.obstacles,
      net: this.net,
      trajectory: this.state === 'dragging' ? trajectory(this.physics.position, this.pull) : [],
      particles: this.particles,
      camera: this.camera,
      hud: this.hud,
      score: this.score.score,
      highScore: this.score.highScore,
      combo: this.score.combo,
      mode: this.mode,
    });
    this.animationFrame = requestAnimationFrame((next) => this.frame(next));
  }
}
