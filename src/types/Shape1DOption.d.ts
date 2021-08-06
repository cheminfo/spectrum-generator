interface Shape1DOptions {
  fwhm?: number;
  sd?: number;
  mu?: number;
  height?: number;
  length?: number;
}

export interface Shape1DOption {
  /**
   * kind of shape
   */
  kind?: string;
  /**
   * Options for the specific kind of shape
   */
  options?: Shape1DOptions;
}
