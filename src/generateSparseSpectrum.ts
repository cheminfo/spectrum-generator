import type { DataXY } from 'cheminfo-types';

import type { OptionsSG1D } from './BaseSpectrumGenerator.ts';
import type { SparseSpectrumOptions } from './SparseSpectrumGenerator.ts';
import { SparseSpectrumGenerator } from './SparseSpectrumGenerator.ts';
import type { Peak1D, PeakSeries } from './types/Peaks1D.ts';

export interface GenerateSparseSpectrumOptions extends SparseSpectrumOptions {
  /**
   * Options for the spectrum generator grid.
   */
  generator?: OptionsSG1D;
}

/**
 * Generates a sparse spectrum containing only x values where at least one peak
 * contributes above the threshold. Unlike `generateSpectrum`, no dense array
 * is allocated: intervals are computed per peak first, then y is evaluated only
 * for the merged set of required x values.
 * @param peaks - List of peaks to include.
 * @param options - Configuration for sparse spectrum generation.
 * @returns Sparse spectrum data with x and y arrays covering only peak regions.
 */
export function generateSparseSpectrum(
  peaks: Peak1D[] | PeakSeries,
  options: GenerateSparseSpectrumOptions = {},
): DataXY<Float64Array> {
  const { generator, ...rest } = options;
  return new SparseSpectrumGenerator(generator).generateSparseSpectrum(
    peaks,
    rest,
  );
}
