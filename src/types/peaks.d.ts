import type { Shape1DOption } from './Shape1DOption';

export interface PeakObject {
  x: number;
  y: number;
  width?: number;
  shape?: Shape1DOption;
}

export interface PeakSeries {
  x: number[];
  y: number[];
  width?: [number];
}

export type peakArray = [number, number, number?, Shape1DOption?];
export type peak = peakArray | PeakObject;
