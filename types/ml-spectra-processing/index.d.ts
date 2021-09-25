declare module 'ml-spectra-processing' {
  import { DoubleArray } from 'cheminfo-types';
  function xyMaxYPoint(data: {
    x: DoubleArray;
    y: DoubleArray;
  }): {
    x: number;
    y: number;
    index: number;
  };
}
