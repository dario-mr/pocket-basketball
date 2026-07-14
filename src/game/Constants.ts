export const WORLD = { width: 960, height: 540, floorY: 485, gravity: 1, step: 1000 / 60 } as const;
export const BALL = {
  radius: 20,
  restitution: 0.75,
  frictionAir: 0.008,
  launchScale: 0.115,
  maxPull: 190,
} as const;
export const HOOP = { radius: 8, rimY: 190, gap: 72, boardWidth: 12, boardHeight: 125 } as const;
export const COLORS = {
  court: '#dba66e',
  wall: '#1b263b',
  line: '#f8e8d0',
  orange: '#ed7d2b',
  ink: '#161616',
} as const;
