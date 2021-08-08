import type { Gaussian2DClassOptions } from 'ml-peak-shape-generator';

interface Shape2DOption {
  /**
   * kind of shape
   */
  kind?: string;
  /**
   * Options for the specific kind of shape
   */
  options?: Gaussian2DClassOptions;
}
