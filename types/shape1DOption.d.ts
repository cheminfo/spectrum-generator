import {
  GaussianClassOptions,
  LorentzianClassOptions,
  PseudoVoigtClassOptions,
} from 'ml-peak-shape-generator';

export interface Shape1DOption {
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
