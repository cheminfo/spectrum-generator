import { XYNumber } from './XYNumber';

interface Shape1DOptions {
  fwhm: number | XYNumber;
  sd?: number | XYNumber;
  length?: number | XYNumber;
  height?: number;
}

export interface Shape2DOption {
  kind?: string;
  options?: Shape1DOptions;
}
