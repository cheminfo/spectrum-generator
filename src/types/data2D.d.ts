import type { Data } from './Data';

interface Data2D extends Data {
  z: Float64Array[] | number[][];
}
