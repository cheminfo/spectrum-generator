import { getShapeGenerator } from 'ml-peak-shape-generator';

import type { AddNoiseOptions } from './types/addNoiseOptions';
import type { Data } from './types/data';
import type { PeakSeries, peak } from './types/peaks';
import type { Shape } from './types/shape';
import addBaseline from './util/addBaseline';
import addNoise from './util/addNoise';

type numToNumFn = (x: number) => number;

interface OptionsSG1D {
  from?: number;
  to?: number;
  nbPoints?: number;
  interval?: number;
  peakWidthFct?: numToNumFn;
  maxPeakHeight?: number;
  shape?: Shape;
}

interface AddPeakOptions {
  width?: number;
  widthLeft?: number;
  widthRight?: number;
  shape?: Shape;
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
  baseline?: numToNumFn;
  /**
   * Options to add noise to the spectrum
   */
  noise?: { percent: number; options: AddNoiseOptions };
  /**
   * Options for addPeaks method
   */
  peaks?: AddPeakOptions;
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
  private peakWidthFct: numToNumFn;
  private maxPeakHeight: number;
  private shape: any;
  private shapeParameters: any;
  private data: Data;
  /**
   *
   * @param {object} [options={}]
   * @param {number} [options.from=0]
   * @param {number} [options.to=0]
   * @param {function} [options.nbPoints=10001]
   * @param {number} [options.factor] default value depends of the shape in order to cover 99.99% of the surface
   * @param {object} [options.shape={kind:'gaussian'}]
   * @param {string} [options.shape.kind] kind of shape, gaussian, lorentzian or pseudovoigt
   * @param {object} [options.shape.options] options for the shape (like `mu` for pseudovoigt)
   */
  public constructor(options: OptionsSG1D = {}) {
    const {
      from = 0,
      to = 1000,
      nbPoints = 10001,
      peakWidthFct = () => 5,
      shape = {
        kind: 'gaussian',
      },
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

    let shapeGenerator = getShapeGenerator(shape.kind);
    this.shape = shapeGenerator;
    this.shapeParameters = shape.options || {};

    assertNumber(this.from, 'from');
    assertNumber(this.to, 'to');
    assertInteger(this.nbPoints, 'nbPoints');

    if (this.to <= this.from) {
      throw new RangeError('to option must be larger than from');
    }

    if (typeof this.peakWidthFct !== 'function') {
      throw new TypeError('peakWidthFct option must be a function');
    }

    this.reset();
  }

  public addPeaks(peaks: peak[] | PeakSeries, options?: AddPeakOptions) {
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

  public addPeak(peak: peak, options: AddPeakOptions = {}) {
    if (Array.isArray(peak) && peak.length < 2) {
      throw new Error(
        'peak must be an array with two (or three) values or an object with {x,y,width?}',
      );
    } else if (Array.isArray(peak) && peak.length > 3) {
      if (typeof peak[3] !== 'object') {
        throw new Error(
          'The fourth element of a peak array should be an object of options',
        );
      }
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
    let peakWidth;
    let peakShapeOptions;
    if (Array.isArray(peak)) {
      [xPosition, intensity, peakWidth, peakShapeOptions] = peak;
    } else {
      xPosition = peak.x;
      intensity = peak.y;
      peakWidth = peak.width;
      peakShapeOptions = peak.shape;
    }
    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let {
      width = peakWidth === undefined
        ? this.peakWidthFct(xPosition)
        : peakWidth,
      widthLeft,
      widthRight,
      shape: shapeOptions = {},
    } = options;

    if (peakShapeOptions) {
      shapeOptions = { ...shapeOptions, ...peakShapeOptions };
    }

    const { kind } = shapeOptions;

    const shapeGenerator = shapeOptions ? getShapeGenerator(kind) : this.shape;
    const shapeParameters = shapeOptions?.options || this.shapeParameters;

    if (!widthLeft) widthLeft = width;
    if (!widthRight) widthRight = width;

    let factor =
      options.factor === undefined
        ? shapeGenerator.getFactor()
        : options.factor;

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

    shapeParameters.fwhm = widthLeft;
    let shapeFct = shapeGenerator.curry(shapeParameters);
    for (let index = firstPoint; index < Math.max(middlePoint, 0); index++) {
      this.data.y[index] +=
        intensity * shapeFct(this.data.x[index] - xPosition);
    }

    // we calculate the right part of the gaussian
    shapeParameters.fwhm = widthRight;
    shapeFct = shapeGenerator.curry(shapeParameters);
    for (
      let index = Math.min(middlePoint, lastPoint);
      index <= lastPoint;
      index++
    ) {
      this.data.y[index] +=
        intensity * shapeFct(this.data.x[index] - xPosition);
    }

    return this;
  }

  public addBaseline(baselineFct: numToNumFn) {
    addBaseline(this.data, baselineFct);
    return this;
  }

  public addNoise(percent: number, options: AddNoiseOptions) {
    addNoise(this.data, percent, options);
    return this;
  }

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

export function generateSpectrum(
  peaks: peak[] | PeakSeries,
  options: GenerateSpectrumOptions = {},
): Data {
  const {
    generator: generatorOptions,
    noise,
    baseline,
    threshold,
    peaks: addPeaksOptions,
  } = options;

  const generator = new SpectrumGenerator(generatorOptions);

  generator.addPeaks(peaks, addPeaksOptions);
  if (baseline) generator.addBaseline(baseline);
  if (noise) {
    const { percent, options: addNoiseOptions } = noise;
    generator.addNoise(percent, addNoiseOptions);
  }
  return generator.getSpectrum({
    threshold,
  });
}
