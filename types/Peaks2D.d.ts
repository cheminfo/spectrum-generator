import type { XYNumber } from 'ml-peak-shape-generator';

import type { Shape2DOption } from './Shape2DOption';
import type { DoubleArray } from 'cheminfo-types';

export interface Peak2DObject {
  x: number;
  y: number;
  z: number;
  width?: number | XYNumber;
  shape?: Shape2DOption;
}

export interface Peak2DSeries {
  x: DoubleArray;
  y: DoubleArray;
  z: DoubleArray;
}

export type Peak2DArray = [number, number, number, number?, Shape2DOption?];
export type Peak2D = Peak2DArray | Peak2DObject;
