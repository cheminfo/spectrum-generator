import type { Data1D } from './Data1D';

interface Data2D extends Data1D {
  z: Float64Array[] | number[][];
}
