import type { Shape } from './shape';
import type { xyNumber } from './xyNumber';

export interface PeakObject {
  [index: string]: number | xyNumber | Shape | undefined;
  x: number;
  y: number;
  z: number;
  width?: number | xyNumber;
  shape?: Shape;
}

export interface PeakSeries {
  [index: string]:
    | number
    | Float64Array
    | xyNumber
    | Array<number | xyNumber>
    | undefined;
  x: Float64Array | number[];
  y: Float64Array | number[];
  z: Float64Array | number[];
  width?: Float64Array | number | xyNumber | Array<number | xyNumber>;
}

export type peakArray = [number, number, number, number?, any?];
export type peak = peakArray | PeakObject;
