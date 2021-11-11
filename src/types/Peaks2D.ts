import type { DoubleArray } from 'cheminfo-types';
import type { XYNumber, Shape2D } from 'ml-peak-shape-generator';

export interface Peak2DObject {
  x: number;
  y: number;
  z: number;
  fwhm?: number | XYNumber;
  width?: number | XYNumber;
  shape?: Shape2D;
}

export interface Peak2DSeries {
  x: DoubleArray;
  y: DoubleArray;
  z: DoubleArray;
}

export type Peak2DArray = [number, number, number, number?, Shape2D?];
export type Peak2D = Peak2DArray | Peak2DObject;
