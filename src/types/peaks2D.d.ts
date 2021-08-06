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
  [index: string]:
    | number
    | Float64Array
    | XYNumber
    | Array<number | XYNumber>
    | undefined;
  x: Float64Array | number[];
  y: Float64Array | number[];
  z: Float64Array | number[];
  width?: Float64Array | number | XYNumber | Array<number | XYNumber>;
}

export type peakArray = [number, number, number, number?, Shape2DOption?];
export type peak = peakArray | PeakObject;
