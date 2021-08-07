import type { Shape2DOption } from './Shape2DOption';
import type { XYNumber } from './XYNumber';

export interface PeakObject {
  x: number;
  y: number;
  z: number;
  width?: number | XYNumber;
  shape?: Shape2DOption;
}

export interface PeakSeries {
  x: Float64Array | number[];
  y: Float64Array | number[];
  z: Float64Array | number[];
}

export type peakArray = [number, number, number, number?, Shape2DOption?];
export type peak = peakArray | PeakObject;
