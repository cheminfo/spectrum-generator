import type { XYNumber } from 'ml-peak-shape-generator';

import type { Shape2DOption } from './Shape2DOption';

export interface Peak2DObject {
  x: number;
  y: number;
  z: number;
  width?: number | XYNumber;
  shape?: Shape2DOption;
}

export interface Peak2DSeries {
  x: Float64Array | number[];
  y: Float64Array | number[];
  z: Float64Array | number[];
}

export type Peak2DArray = [number, number, number, number?, Shape2DOption?];
export type Peak2D = Peak2DArray | Peak2DObject;
