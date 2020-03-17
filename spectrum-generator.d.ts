export interface SpectrumGeneratorOptions {
  /**
   * First x value (inclusive).
   * @default `0`
   */
  from?: number;

  /**
   * Last x value (inclusive).
   * @default `1000`
   */
  to?: number;

  /**
   * Function that returns the width of a peak depending the x value.
   * @default `() => 5`
   */
  peakWidthFct?: (x: number) => number;

  /**
   * Define the shape of the peak.
   * @default `shape: {
          kind: 'gaussian',
          options: {
            fwhm: 1000,
            length: 5001,
          },
        },`
   */
  shape?: object;

  /**
   * Number of points in the final spectrum.
   * @default `10001`
   */
  nbPoints?: number;
}

export interface PeakOptions {
  /**
   * Half-height width.
   * @default `peakWidthFct(value)`
   */
  width?: number;

  /**
   * Half-height width left (asymmetric peak).
   * @default `width`
   */
  widthLeft?: number;

  /**
   * Half-height width right (asymmetric peak).
   * @default `width`
   */
  widthRight?: number;
}

export interface AddNoiseOptions {
  /**
   * Seed for a deterministic sequence of random numbers.
   */
  seed?: number;

  /**
   * Type of random distribution.
   * 'uniform' (true random) or 'normal' (gaussian distribution)
   */
  distribution?: 'uniform' | 'normal';
}

export interface GetSpectrumOptions {
  /**
   * Minimal ratio of Y to keep the value.
   * @default `0`
   */
  threshold?: number;

  /**
   * If true, returns a copy of the spectrum.
   * Otherwise, return the internal value that can be mutated if subsequent calls to addPeak are made.
   * @default `true`
   */
  copy?: boolean;
}

export interface Spectrum {
  x: number[];
  y: number[];
}

export class SpectrumGenerator {
  /**
   *
   * @example
   * import SG from 'spectrum-generator';
   * const sg = new SG({from: 0, to: 100, nbPoints: 1001, peakWidthFct: (x) => 1 + 3 * x / 1000 });
   * sg.addPeak([5, 50]);
   * sg.addPeak({x:10, y:50}); // either an array of an object with x,y properties
   * sg.addPeak([20, 100], { width: 3 });
   * sg.addPeak([35, 100], { widthLeft: 10, widthRight: 30 });
   * sg.addPeak([50, 10], { widthLeft: 5, widthRight: 5 });
   * sg.addPeaks([ [70,20], [80,40], [90,10] ]);
   * sg.addNoise(10);
   * sg.addBaseline( (x) => x * x / 100 );
   * var spectrum = sg.getSpectrum();
   *
   * @example
   * import SG from 'spectrum-generator';
   * const spectrum=SG.generateSpectrum([ [20,3], [30,2], [40,2] ], {
   *  from: 0,
   *  to: 100,
   *  nbPoints: 101,
   *  noise: {
   *    percent: 10,
   *    distribution: 'normal',
   *    seed: 42
   *  },
   *  baseline: (x) => 2 * x,
   * })
   */
  constructor(options?: SpectrumGeneratorOptions);

  get size(): number;

  /**
   * Add a series of peaks to the spectrum.
   * @param peaks - Peaks to add.
   */
  addPeaks(peaks: number[][]): this;

  /**
   * Add a single peak to the spectrum.
   * @param peak
   * @param options
   */
  addPeak(peak: number[], options?: PeakOptions): this;

  /**
   * Add a baseline to the spectrum.
   * @param baselineFct - Mathematical function producing the baseline you want.
   */
  addBaseline(baselineFct: (y: number) => number): this;

  /**
   * Add noise to the spectrum.
   * @param percent - Noise's amplitude in percents of the spectrum max value. Default: 0.
   */
  addNoise(percent: number, options: AddNoiseOptions): this;

  /**
   * Get the generated spectrum.
   */
  getSpectrum(options: GetSpectrumOptions): Spectrum;

  /**
   * Resets the generator with an empty spectrum.
   */
  reset(): this;
}

/**
 * Generates a spectrum and returns it.
 * @param peaks - List of peaks to put in the spectrum.
 * @param options
 */
export function generateSpectrum(
  peaks: number[][],
  options: SpectrumGeneratorOptions,
): Spectrum;
