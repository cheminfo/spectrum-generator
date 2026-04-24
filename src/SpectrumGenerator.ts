import type { DataXY } from 'cheminfo-types';

import { BaseSpectrumGenerator } from './BaseSpectrumGenerator.ts';
import type {
  NumToNumFn,
  OptionsSG1D,
  PeakOptions,
} from './BaseSpectrumGenerator.ts';
import type { Peak1D, PeakSeries } from './types/Peaks1D.ts';
import addBaseline from './util/addBaseline.ts';
import type { NoiseOptions } from './util/addNoise.ts';
import addNoise from './util/addNoise.ts';

export type {
  NumToNumFn,
  OptionsSG1D,
  PeakOptions,
  ResolvedPeak,
} from './BaseSpectrumGenerator.ts';
export { BaseSpectrumGenerator } from './BaseSpectrumGenerator.ts';

export interface SpectrumOptions {
  /**
   * Function to generate or add a baseline.
   */
  baseline?: NumToNumFn;
  /**
   * Options to add noise to the spectrum.
   */
  noise?: NoiseOptions;
  /**
   * Options for peak shapes and widths.
   */
  peakOptions?: PeakOptions;
  /**
   * Minimum intensity value.
   * @default 0
   */
  threshold?: number;
}

export interface GetSpectrumOptions {
  /**
   * generate a copy of the current data
   * @default true
   */
  copy?: boolean;
  /**
   * minimum intensity value
   * @default 0
   */
  threshold?: number;
}

export class SpectrumGenerator extends BaseSpectrumGenerator {
  private maxPeakHeight: number;
  private data: DataXY<Float64Array>;

  public constructor(options: OptionsSG1D = {}) {
    super(options);
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;
    this.data = {
      x: new Float64Array(this.nbPoints),
      y: new Float64Array(this.nbPoints),
    };
    this.reset();
  }

  /**
   * Generates a spectrum from a list of peaks and returns it.
   * @param peaks - List of peaks to add.
   * @param options - Options for spectrum generation.
   * @returns The generated spectrum data.
   */
  public generateSpectrum(
    peaks: Peak1D[] | PeakSeries,
    options: SpectrumOptions = {},
  ) {
    const { noise, baseline, threshold, peakOptions } = options;
    this.addPeaks(peaks, peakOptions);
    if (baseline) this.addBaseline(baseline);
    if (noise) this.addNoise(noise);
    return this.getSpectrum({ threshold });
  }

  /**
   * Add a series of peaks to the spectrum.
   * @param peaks - Peaks to add.
   * @param options - Options for adding peaks.
   * @returns The generator instance.
   */
  public addPeaks(peaks: Peak1D[] | PeakSeries, options?: PeakOptions) {
    if (
      !Array.isArray(peaks) &&
      (typeof peaks !== 'object' ||
        peaks.x === undefined ||
        peaks.y === undefined ||
        !Array.isArray(peaks.x) ||
        !Array.isArray(peaks.y) ||
        peaks.x.length !== peaks.y.length)
    ) {
      throw new TypeError(
        'peaks must be an array or an object containing x[] and y[]',
      );
    }
    if (Array.isArray(peaks)) {
      for (const peak of peaks) {
        this.addPeak(peak, options);
      }
    } else {
      for (let i = 0; i < peaks.x.length; i++) {
        this.addPeak([peaks.x[i], peaks.y[i]], options);
      }
    }
    return this;
  }

  /**
   * Add a single peak to the spectrum.
   * A peak may be either defined as [x,y,fwhm,...] or as {x, y, shape}
   * @param peak - The peak to add, defined as array or object.
   * @param options - Options for adding the peak.
   * @returns The generator instance.
   */
  public addPeak(peak: Peak1D, options: PeakOptions = {}) {
    if (Array.isArray(peak) && peak.length < 2) {
      throw new Error(
        'peak must be an array with two (or three) values or an object with {x,y,width?}',
      );
    }
    if (
      !Array.isArray(peak) &&
      (peak.x === undefined || peak.y === undefined)
    ) {
      throw new Error(
        'peak must be an array with two (or three) values or an object with {x,y,width?}',
      );
    }

    const {
      x0,
      intensity,
      shapeLeft,
      shapeRight,
      widthLeft,
      widthRight,
      factor,
    } = this.resolvePeak(peak, options);

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    const firstValue = x0 - (widthLeft / 2) * factor;
    const lastValue = x0 + (widthRight / 2) * factor;

    const firstPoint = Math.max(
      0,
      Math.floor((firstValue - this.from) / this.interval),
    );
    const lastPoint = Math.min(
      this.nbPoints - 1,
      Math.ceil((lastValue - this.from) / this.interval),
    );
    const middlePoint = Math.round((x0 - this.from) / this.interval);

    // PEAK SHAPE MAY BE ASYMMETRIC (widthLeft and widthRight) !
    // we calculate the left part of the shape
    for (let index = firstPoint; index < Math.max(middlePoint, 0); index++) {
      this.data.y[index] += intensity * shapeLeft.fct(this.data.x[index] - x0);
    }

    // we calculate the right part of the gaussian
    for (
      let index = Math.min(middlePoint, lastPoint);
      index <= lastPoint;
      index++
    ) {
      this.data.y[index] += intensity * shapeRight.fct(this.data.x[index] - x0);
    }

    return this;
  }

  /**
   * Add a baseline to the spectrum.
   * @param baselineFct - Mathematical function producing the baseline you want.
   * @returns The generator instance.
   */
  public addBaseline(baselineFct: (x: number) => number) {
    addBaseline(this.data, baselineFct);
    return this;
  }

  /**
   * Add noise to the spectrum.
   * @param options - Configuration for noise generation.
   * @returns The generator instance.
   */
  public addNoise(options?: NoiseOptions) {
    addNoise(this.data, options);
    return this;
  }

  /**
   * Get the generated spectrum.
   * @param options - Options for getting the spectrum.
   * @returns The generated spectrum data.
   */
  public getSpectrum(options: GetSpectrumOptions | boolean = {}) {
    if (typeof options === 'boolean') {
      options = { copy: options };
    }
    const { copy = true, threshold = 0 } = options;
    if (threshold) {
      const minPeakHeight = this.maxPeakHeight * threshold;
      const x = [];
      const y = [];
      for (let i = 0; i < this.data.x.length; i++) {
        if (this.data.y[i] >= minPeakHeight) {
          x.push(this.data.x[i]);
          y.push(this.data.y[i]);
        }
      }
      return { x: Float64Array.from(x), y: Float64Array.from(y) };
    }
    if (copy) {
      return {
        x: this.data.x.slice(),
        y: this.data.y.slice(),
      };
    } else {
      return this.data;
    }
  }

  /**
   * Resets the generator with an empty spectrum.
   * @returns The generator instance.
   */
  public reset() {
    if (this.nbPoints === 1) {
      this.data.x[0] = (this.from + this.to) / 2;
    } else {
      for (let i = 0; i < this.nbPoints; i++) {
        this.data.x[i] = this.from + i * this.interval;
      }
    }
    return this;
  }
}
