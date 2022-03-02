import type { DataXY } from 'cheminfo-types';
import { getShape1D } from 'ml-peak-shape-generator';
import type { Shape1D, Shape1DInstance } from 'ml-peak-shape-generator';

import type { PeakSeries, Peak1D } from './types/Peaks1D';
import addBaseline from './util/addBaseline';
import type { NoiseOptions } from './util/addNoise';
import addNoise from './util/addNoise';

type NumToNumFn = (x: number) => number;

interface OptionsSG1D {
  /**
   * First x value (inclusive).
   * @default 0
   */
  from?: number;
  /**
   * Last x value (inclusive).
   * @default 1000
   */
  to?: number;
  /**
   * Number of points in the final spectrum.
   * @default 10001
   */
  nbPoints?: number;
  /**
   * Function that returns the width of a peak depending the x value.
   * @default "() => 5"
   */
  peakWidthFct?: NumToNumFn;
  /**
   * Define the shape of the peak.
   * @default "{kind: 'gaussian'}"
   */
  shape?: Shape1D;
}

interface PeakOptions {
  /**
   * Half-height width.
   * @default `peakWidthFct(value)`
   */
  width?: number;
  /**
   * Half-height width left (asymmetric peak).
   * @default `fwhm`
   */
  widthLeft?: number;
  /**
   * Half-height width right (asymmetric peak).
   * @default `fwhm`
   */
  widthRight?: number;
  /**
   * Shape options
   */
  shape?: Shape1D;
  /**
   * Number of times of fwhm to calculate length..
   * @default 'covers 99.99 % of surface'
   */
  factor?: number;
}

interface GenerateSpectrumOptions {
  /**
   * Options for spectrum generator
   */
  generator?: OptionsSG1D;
  /**
   * Function to generate or add a baseline
   */
  baseline?: NumToNumFn;
  /**
   * Options to add noise to the spectrum
   */
  noise?: NoiseOptions;
  /**
   * Options for addPeaks method
   */
  peakOptions?: PeakOptions;
  /**
   * minimum intensity value
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

export class SpectrumGenerator {
  private from: number;
  private to: number;
  private nbPoints: number;
  public interval: number;
  private peakWidthFct: NumToNumFn | undefined;
  private maxPeakHeight: number;
  private shape: Shape1DInstance;
  private data: DataXY;
  public constructor(options: OptionsSG1D = {}) {
    const {
      from = 0,
      to = 1000,
      nbPoints = 10001,
      peakWidthFct,
      shape = { kind: 'gaussian', fwhm: 5 },
    } = options;

    this.from = from;
    this.to = to;
    this.nbPoints = nbPoints;
    this.interval = (this.to - this.from) / (this.nbPoints - 1);
    this.peakWidthFct = peakWidthFct;
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;

    this.data = {
      x: new Float64Array(this.nbPoints),
      y: new Float64Array(this.nbPoints),
    };

    let shapeGenerator = getShape1D(shape);
    this.shape = shapeGenerator;

    assertNumber(this.from, 'from');
    assertNumber(this.to, 'to');
    assertInteger(this.nbPoints, 'nbPoints');

    if (this.to <= this.from) {
      throw new RangeError('to option must be larger than from');
    }

    if (this.peakWidthFct && typeof this.peakWidthFct !== 'function') {
      throw new TypeError('peakWidthFct option must be a function');
    }

    this.reset();
  }

  /**
   * Add a series of peaks to the spectrum.
   * @param peaks - Peaks to add.
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
  }
  /**
   * Add a single peak to the spectrum.
   * A peak may be either defined as [x,y,fwhm,...] or as {x, y, shape}
   * @param peak
   * @param options
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

    let xPosition;
    let intensity;
    let peakFWHM;
    let peakWidth;
    let peakShapeOptions;
    if (Array.isArray(peak)) {
      [xPosition, intensity, peakFWHM, peakShapeOptions] = peak;
    } else {
      xPosition = peak.x;
      intensity = peak.y;
      peakWidth = peak.width;
      peakShapeOptions = peak.shape;
    }
    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let { shape: shapeOptions } = options;

    if (peakShapeOptions) {
      shapeOptions = shapeOptions
        ? { ...shapeOptions, ...peakShapeOptions }
        : peakShapeOptions;
    }

    if (shapeOptions) {
      this.shape = getShape1D(shapeOptions);
    }

    let { widthLeft, widthRight } = options;
    /*
     if we don't force the fwhm we just take the one from the shape
     however we have many way to force it:
     - use [x,y,fwhm]
     - define `width` that will be converted to fwhm
     - define `widthLeft` and `widthRight` to define asymmetric peaks
     - have a callback `peakWidthFct`
     This should evolve in the future because we will not always have `fwhm`
     */
    const fwhm =
      peakFWHM !== undefined
        ? peakFWHM
        : peakWidth
        ? this.shape.widthToFWHM(peakWidth)
        : this.peakWidthFct
        ? this.peakWidthFct(xPosition)
        : this.shape.fwhm;

    if (!widthLeft) widthLeft = fwhm;
    if (!widthRight) widthRight = fwhm;

    if (!widthLeft || !widthRight) {
      throw new Error('Width left or right is undefined or zero');
    }

    let factor =
      options.factor === undefined ? this.shape.getFactor() : options.factor;

    const firstValue = xPosition - (widthLeft / 2) * factor;
    const lastValue = xPosition + (widthRight / 2) * factor;

    const firstPoint = Math.max(
      0,
      Math.floor((firstValue - this.from) / this.interval),
    );
    const lastPoint = Math.min(
      this.nbPoints - 1,
      Math.ceil((lastValue - this.from) / this.interval),
    );
    const middlePoint = Math.round((xPosition - this.from) / this.interval);
    // PEAK SHAPE MAY BE ASYMMETRC (widthLeft and widthRight) !
    // we calculate the left part of the shape

    this.shape.fwhm = widthLeft;
    for (let index = firstPoint; index < Math.max(middlePoint, 0); index++) {
      this.data.y[index] +=
        intensity * this.shape.fct(this.data.x[index] - xPosition);
    }

    // we calculate the right part of the gaussian
    this.shape.fwhm = widthRight;
    for (
      let index = Math.min(middlePoint, lastPoint);
      index <= lastPoint;
      index++
    ) {
      this.data.y[index] +=
        intensity * this.shape.fct(this.data.x[index] - xPosition);
    }
  }

  /**
   * Add a baseline to the spectrum.
   * @param baselineFct - Mathematical function producing the baseline you want.
   */
  public addBaseline(baselineFct: NumToNumFn) {
    addBaseline(this.data, baselineFct);
    return this;
  }

  /**
   * Add noise to the spectrum.
   *
   * @param percent - Noise's amplitude in percents of the spectrum max value. Default: 1.
   */
  public addNoise(options?: NoiseOptions) {
    addNoise(this.data, options);
    return this;
  }

  /**
   * Get the generated spectrum.
   */
  public getSpectrum(options: GetSpectrumOptions | boolean = {}) {
    if (typeof options === 'boolean') {
      options = { copy: options };
    }
    const { copy = true, threshold = 0 } = options;
    if (threshold) {
      let minPeakHeight = this.maxPeakHeight * threshold;
      let x = [];
      let y = [];
      for (let i = 0; i < this.data.x.length; i++) {
        if (this.data.y[i] >= minPeakHeight) {
          x.push(this.data.x[i]);
          y.push(this.data.y[i]);
        }
      }
      return { x, y };
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
   */
  public reset() {
    const spectrum = this.data;

    for (let i = 0; i < this.nbPoints; i++) {
      spectrum.x[i] = this.from + i * this.interval;
    }

    return this;
  }
}

function assertInteger(value: number, name: string) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} option must be an integer`);
  }
}

function assertNumber(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} option must be a number`);
  }
}

/**
 * Generates a spectrum and returns it.
 * @param peaks - List of peaks to put in the spectrum.
 * @param options
 */

export function generateSpectrum(
  peaks: Peak1D[] | PeakSeries,
  options: GenerateSpectrumOptions = {},
): DataXY {
  const {
    generator: generatorOptions,
    noise,
    baseline,
    threshold,
    peakOptions,
  } = options;

  const generator = new SpectrumGenerator(generatorOptions);

  generator.addPeaks(peaks, peakOptions);
  if (baseline) generator.addBaseline(baseline);
  if (noise) {
    generator.addNoise(noise);
  }
  return generator.getSpectrum({
    threshold,
  });
}
