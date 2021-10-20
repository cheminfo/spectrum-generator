import type { Gaussian2DClassOptions } from 'ml-peak-shape-generator';

export interface Shape2DOptions {
  /**
   * kind of shape
   */
  kind?: string;
  /**
   * Options for the specific kind of shape
   */
  options?: Gaussian2DClassOptions;
}
