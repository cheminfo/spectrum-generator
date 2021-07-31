import type { Data } from './data';

interface Data2D extends Data {
  [index: string]: Float64Array | number[] | Float64Array[] | number[][];
  z: Float64Array[] | number[][];
}
