import type { DataXY } from 'cheminfo-types';

export interface Data2D extends DataXY {
  z: Float64Array[] | number[][];
}
