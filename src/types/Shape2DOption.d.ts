import { XYNumber } from './XYNumber';

interface Shape2DOptions {
  fwhm: number | XYNumber;
  sd?: number | XYNumber;
  length?: number | XYNumber;
  height?: number;
}

export interface Shape2DOption {
  /**
   * kind of shape
   */
  kind?: string;
  /**
   * Options for the specific kind of shape
   */
  options?: Shape2DOptions;
}
