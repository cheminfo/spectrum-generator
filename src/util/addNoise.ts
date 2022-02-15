import type { DataXY } from 'cheminfo-types';
import { xMaxValue, xAdd, createRandomArray } from 'ml-spectra-processing';

export interface NoiseOptions {
  /**
   * Type of random distribution.
   * 'uniform' (true random) or 'normal' (gaussian distribution)
   * @default 'normal'
   */
  distribution?: 'uniform' | 'normal';
  /**
   * Seed for a deterministic sequence of random numbers.
   * @default 0
   */
  seed?: number;
  /**
   * Percentage of noise. The range of the noise will be the percentage so if a peak is 100 and you
   * have a percent of 10, the noise will be values between -5 and 5.
   * In the case of normal distribution the range will correspond to the standard deviation
   * @default 1
   */
  percent?: number;
}

export default function addNoise(data: DataXY, options: NoiseOptions = {}) {
  const { seed = 0, distribution = 'normal', percent = 1 } = options;
  const range = (xMaxValue(data.y) * percent) / 100;
  const noise = createRandomArray({
    distribution,
    seed,
    mean: 0,
    standardDeviation: range,
    range,
    length: data.x.length,
  });
  data.y = xAdd(data.y, noise);
  return data;
}
