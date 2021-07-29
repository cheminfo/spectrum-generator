import type { Shape } from './shape';

export interface PeakObject {
  x: number;
  y: number;
  width?: number;
  shape?: Shape;
}

export interface PeakSeries {
  x: number[];
  y: number[];
  width?: [number];
}

export type peakArray = [number, number, number?, any?];
export type peak = peakArray | PeakObject;
