import {
  GaussianClassOptions,
  LorentzianClassOptions,
  PseudoVoigtClassOptions,
} from 'ml-peak-shape-generator';

export interface Shape1DOptions {
  /**
   * kind of shape
   */
  kind?: string;
  /**
   * Options for the specific kind of shape
   */
  options?:
    | GaussianClassOptions
    | LorentzianClassOptions
    | PseudoVoigtClassOptions;
}
