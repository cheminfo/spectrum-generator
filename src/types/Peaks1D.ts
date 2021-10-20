import type { DoubleArray } from 'cheminfo-types';

import type { Shape1DOptions } from './Shape1DOptions';

export interface PeakObject {
  x: number;
  y: number;
  width?: number;
  shape?: Shape1DOptions;
}

export interface PeakSeries {
  x: DoubleArray;
  y: DoubleArray;
  width?: DoubleArray;
}

export type PeakArray = [number, number, number?, Shape1DOptions?];
export type Peak1D = PeakArray | PeakObject;
