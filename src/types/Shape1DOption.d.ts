interface Shape1DOptions {
  fwhm?: number;
  sd?: number;
  mu?: number;
  height?: number;
  length?: number;
}

export interface Shape1DOption {
  kind?: string;
  options?: Shape1DOptions;
}
