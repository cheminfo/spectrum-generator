import type { DoubleArray } from 'cheminfo-types';
import type { Shape1D } from 'ml-peak-shape-generator';

export interface PeakObject {
  x: number;
  y: number;
  width?: number;
  shape?: Shape1D;
}

export interface PeakSeries {
  x: DoubleArray;
  y: DoubleArray;
  fwhm?: DoubleArray;
}

export type PeakArray = [number, number, number?, Shape1D?];
export type Peak1D = PeakArray | PeakObject;
