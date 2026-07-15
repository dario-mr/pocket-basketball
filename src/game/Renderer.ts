import type { Body } from 'matter-js';
import { BALL, COLORS, HOOP, WORLD } from './Constants';
import type { Camera } from './Camera';
import type { Particles } from './effects/Particles';
import type { Hoop } from './entities/Hoop';
import type { Net } from './entities/Net';
import type { Point } from './Utils';
import type { Hud } from './ui/Hud';

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is not available.');
    this.context = context;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize(): void {
    const ratio = Math.min(window.innerWidth / WORLD.width, window.innerHeight / WORLD.height);
    this.canvas.width = Math.round(window.innerWidth * devicePixelRatio);
    this.canvas.height = Math.round(window.innerHeight * devicePixelRatio);
    this.scale = ratio * devicePixelRatio;
    this.offsetX = (this.canvas.width - WORLD.width * this.scale) / 2;
    this.offsetY = (this.canvas.height - WORLD.height * this.scale) / 2;
  }

  pointFromEvent(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * devicePixelRatio) / this.scale - this.offsetX / this.scale,
      y: ((event.clientY - rect.top) * devicePixelRatio) / this.scale - this.offsetY / this.scale,
    };
  }

  render(args: {
    ball: Body;
    hoop: Hoop;
    net: Net;
    trajectory: Point[];
    particles: Particles;
    camera: Camera;
    hud: Hud;
    score: number;
    highScore: number;
    combo: number;
  }): void {
    const { context } = this;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.save();
    context.translate(
      this.offsetX + args.camera.x * this.scale,
      this.offsetY + args.camera.y * this.scale,
    );
    context.scale(this.scale, this.scale);
    this.background();
    this.floor();
    this.dots(args.trajectory);
    this.hoop(args.hoop);
    this.shadow(args.ball);
    this.ball(args.ball);
    this.net(args.hoop, args.net);
    this.particles(args.particles);
    context.restore();
    args.hud.draw(context, args.score, args.highScore, args.combo);
  }

  private background(): void {
    const gradient = this.context.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, COLORS.wall);
    gradient.addColorStop(1, '#283b55');
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  private floor(): void {
    this.context.fillStyle = COLORS.court;
    this.context.fillRect(0, WORLD.floorY, WORLD.width, WORLD.height - WORLD.floorY);
    this.context.strokeStyle = '#c98951';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(0, WORLD.floorY);
    this.context.lineTo(WORLD.width, WORLD.floorY);
    this.context.stroke();
  }

  private dots(points: Point[]): void {
    this.context.save();
    points.forEach((point, index) => {
      this.context.globalAlpha = (1 - index / points.length) * 0.55;
      this.context.fillStyle = '#fff8e8';
      this.context.beginPath();
      this.context.arc(point.x, point.y, 5 - (index / points.length) * 3, 0, Math.PI * 2);
      this.context.fill();
    });
    this.context.restore();
  }

  private hoop(hoop: Hoop): void {
    const { context } = this;
    const nudge = Math.sin(performance.now() * 0.04) * hoop.vibration;
    context.save();
    context.translate(nudge, 0);
    context.fillStyle = '#e9edf2';
    context.fillRect(hoop.x + HOOP.gap / 2 + 10, hoop.y - 115, HOOP.boardWidth, HOOP.boardHeight);
    context.strokeStyle = '#ea4e4e';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(hoop.x - HOOP.gap / 2, hoop.y);
    context.lineTo(hoop.x + HOOP.gap / 2, hoop.y);
    context.stroke();
    context.fillStyle = '#d94035';
    context.beginPath();
    context.arc(hoop.x - HOOP.gap / 2, hoop.y, HOOP.radius, 0, Math.PI * 2);
    context.arc(hoop.x + HOOP.gap / 2, hoop.y, HOOP.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private shadow(ball: Body): void {
    const height = Math.max(0, WORLD.floorY - ball.position.y - BALL.radius);
    const amount = Math.max(0.16, 1 - height / 340);
    this.context.save();
    this.context.globalAlpha = amount * 0.28;
    this.context.fillStyle = '#101820';
    this.context.beginPath();
    this.context.ellipse(
      ball.position.x,
      WORLD.floorY + 1,
      BALL.radius * amount,
      5 * amount,
      0,
      0,
      Math.PI * 2,
    );
    this.context.fill();
    this.context.restore();
  }

  private ball(ball: Body): void {
    const { context } = this;
    context.save();
    context.translate(ball.position.x, ball.position.y);
    context.rotate(ball.angle);
    context.fillStyle = COLORS.orange;
    context.beginPath();
    context.arc(0, 0, BALL.radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = COLORS.ink;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, BALL.radius, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(0, 0, BALL.radius, Math.PI * 0.25, Math.PI * 1.25);
    context.moveTo(-BALL.radius, 0);
    context.quadraticCurveTo(0, 8, BALL.radius, 0);
    context.moveTo(0, -BALL.radius);
    context.quadraticCurveTo(-8, 0, 0, BALL.radius);
    context.stroke();
    context.restore();
  }

  private net(hoop: Hoop, net: Net): void {
    const { context } = this;
    context.save();
    context.strokeStyle = '#f5f4ed';
    context.globalAlpha = 0.75;
    context.lineWidth = 1.5;
    const top = hoop.y + 3;
    const bottom = top + 42 + net.squash * 14;
    const bottomRadiusX = 20;
    const bottomRadiusY = 4;
    for (let i = -2; i <= 2; i += 1) {
      const x = hoop.x + i * 16;
      const offsetX = i * 10;
      const endpointY = bottom - bottomRadiusY * Math.sqrt(1 - (offsetX / bottomRadiusX) ** 2);
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(hoop.x + offsetX, endpointY);
      context.stroke();
    }
    context.beginPath();
    context.ellipse(hoop.x, bottom, bottomRadiusX, bottomRadiusY, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  private particles(particles: Particles): void {
    this.context.save();
    for (const particle of particles.items) {
      this.context.globalAlpha = particle.life;
      this.context.fillStyle = particle.color;
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, 2 * particle.life, 0, Math.PI * 2);
      this.context.fill();
    }
    this.context.restore();
  }
}
