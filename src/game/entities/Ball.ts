import { Bodies, Body } from 'matter-js';
import { BALL } from '../Constants';

export const createBall = (x: number, y: number): Body =>
  Bodies.circle(x, y, BALL.radius, {
    label: 'ball',
    restitution: BALL.restitution,
    friction: 0.02,
    frictionAir: BALL.frictionAir,
    frictionStatic: 0.5,
    density: 0.002,
    sleepThreshold: 30,
  });
