export type Point = Readonly<{ x: number; y: number }>;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;
export const random = (min: number, max: number): number => min + Math.random() * (max - min);
