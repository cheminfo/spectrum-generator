import type { Shape1DOption } from './Shape1DOption';
import type { DoubleArray } from 'cheminfo-types';

export interface PeakObject {
  x: number;
  y: number;
  width?: number;
  shape?: Shape1DOption;
}

export interface PeakSeries {
  x: DoubleArray;
  y: DoubleArray;
  width?: DoubleArray;
}

export type PeakArray = [number, number, number?, Shape1DOption?];
export type Peak1D = PeakArray | PeakObject;
