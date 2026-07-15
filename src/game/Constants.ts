type World = {
  width: number;
  height: number;
  floorY: number;
  ballStartX: number;
  hoopStartX: number;
  hoopStartY: number;
  hoopDistance: number;
  hoopMinX: number;
  hoopMaxX: number;
  hoopMinY: number;
  hoopMaxY: number;
  gravity: number;
  step: number;
};

const desktopWorld: World = {
  width: 960,
  height: 540,
  floorY: 485,
  ballStartX: 220,
  hoopStartX: 700,
  hoopStartY: 200,
  hoopDistance: 330,
  hoopMinX: 135,
  hoopMaxX: 825,
  hoopMinY: 110,
  hoopMaxY: 270,
  gravity: 1.1,
  step: 1000 / 60,
};

const portraitWorld = (viewportWidth: number, viewportHeight: number): World => {
  const width = 540;
  const height = Math.round((width * viewportHeight) / viewportWidth);
  const floorY = height - 55;
  const hoopStartY = floorY - 345;
  return {
    width,
    height,
    floorY,
    ballStartX: width / 2,
    hoopStartX: 380,
    hoopStartY,
    hoopDistance: 165,
    hoopMinX: 85,
    hoopMaxX: 455,
    hoopMinY: hoopStartY - 140,
    hoopMaxY: hoopStartY + 60,
    gravity: 1.1,
    step: 1000 / 60,
  };
};

export const WORLD: World = { ...desktopWorld };

export const configureWorld = (viewportWidth: number, viewportHeight: number): void => {
  Object.assign(
    WORLD,
    viewportHeight > viewportWidth ? portraitWorld(viewportWidth, viewportHeight) : desktopWorld,
  );
};

export const BALL = {
  radius: 20,
  restitution: 0.75,
  frictionAir: 0.008,
  launchScale: 0.115,
  spinScale: 0.006,
  maxPull: 220,
} as const;

export const HOOP = { radius: 4, rimY: 190, gap: 72, boardWidth: 10, boardHeight: 125 } as const;

export const COLORS = {
  court: '#dba66e',
  wall: '#1b263b',
  line: '#f8e8d0',
  ink: '#161616',
} as const;
