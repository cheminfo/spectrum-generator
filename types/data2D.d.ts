import type { Data1D } from './data1D';

export interface Data2D extends Data1D {
  z: Float64Array[] | number[][];
}
