import type { Data1D } from './Data1D';

export interface Data2D extends Data1D {
  z: Float64Array[] | number[][];
}
