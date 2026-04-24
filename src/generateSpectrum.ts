import type { DataXY } from 'cheminfo-types';

import type { OptionsSG1D, SpectrumOptions } from './SpectrumGenerator.ts';
import { SpectrumGenerator } from './SpectrumGenerator.ts';
import type { Peak1D, PeakSeries } from './types/Peaks1D.ts';

export interface GenerateSpectrumOptions extends SpectrumOptions {
  /**
   * Options for the spectrum generator grid.
   */
  generator?: OptionsSG1D;
}

/**
 * Generates a spectrum and returns it.
 * @param peaks - List of peaks to put in the spectrum.
 * @param options - Configuration for spectrum generation.
 * @returns The generated spectrum data.
 */
export function generateSpectrum(
  peaks: Peak1D[] | PeakSeries,
  options: GenerateSpectrumOptions = {},
): DataXY<Float64Array> {
  const { generator, ...rest } = options;
  return new SpectrumGenerator(generator).generateSpectrum(peaks, rest);
}
