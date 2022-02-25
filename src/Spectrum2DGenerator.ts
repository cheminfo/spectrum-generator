import { getShape2D, Shape2DClass } from 'ml-peak-shape-generator';
import type {
  Shape2D,
  Shape2DInstance,
  XYNumber,
} from 'ml-peak-shape-generator';
import { matrixMinMaxZ } from 'ml-spectra-processing';

import type { Data2D } from './types/Data2D';
import type { Peak2D, Peak2DSeries } from './types/Peaks2D';

type NumToNumFn = (x: number, y?: number) => number | XYNumber;

type Axis2D = 'x' | 'y';
const axis2D: Axis2D[] = ['x', 'y'];

type PeakCoordinates = 'x' | 'y' | 'z';
const peakCoordinates: PeakCoordinates[] = ['x', 'y', 'z'];

const convertWidthToFWHM = (shape: Shape2DClass, width: number | XYNumber) => {
  const widthData = ensureXYNumber(width);
  for (let key of axis2D) {
    widthData[key] = shape.widthToFWHM(widthData[key]);
  }
  return widthData;
};

interface OptionsSG2D {
  /**
   * First x value (inclusive).
   * @default `0`
   */
  from?: number | XYNumber;
  /**
   * Last x value (inclusive).
   * @default `100`
   */
  to?: number | XYNumber;
  /**
   * Number of points in the final spectrum.
   * @default `1001`
   */
  nbPoints?: number | XYNumber;
  /**
   * Function that returns the width of a peak depending the x value.
   * @default `() => 5`
   */
  peakWidthFct?: NumToNumFn;
  /**
   * Define the shape of the peak.
   * @default `shape: {
          kind: 'gaussian',
        },`
   */
  shape?: Shape2D;
}

interface AddPeak2DOptions {
  /**
   * Half-height width.
   * @default `peakWidthFct(value)`
   */
  width?: number | XYNumber;
  fwhm?: number | XYNumber;
  /**
   * Define the shape of the peak.
   */
  shape?: Shape2D;
  /**
   * Number of times of fwhm to calculate length..
   * @default 'covers 99.99 % of volume'
   */
  factor?: number | XYNumber;
}

interface GetSpectrum2DOptions {
  /**
   * generate a copy of the current data
   * @default true
   */
  copy?: boolean;
}

interface GenerateSpectrum2DOptions {
  /**
   * Options for spectrum generator
   */
  generator?: OptionsSG2D;
  /**
   * Options for addPeaks method
   */
  peaks?: AddPeak2DOptions;
}

export interface Spectrum2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  z: Float64Array[] | number[][];
}

export interface Spectrum2DGenerator {
  addPeaks(peaks: Peak2D[] | Peak2DSeries, options?: AddPeak2DOptions): void;
  addPeak(peak: Peak2D, options?: AddPeak2DOptions): void;
  getSpectrum(options?: GetSpectrum2DOptions | boolean): void;
  reset(): void;
}

export class Spectrum2DGenerator implements Spectrum2DGenerator {
  private from: XYNumber;
  private to: XYNumber;
  private nbPoints: XYNumber;
  public interval: XYNumber;
  private data: Data2D;
  private maxPeakHeight: number;
  private shape: Shape2DInstance;
  private peakWidthFct: NumToNumFn;

  public constructor(options: OptionsSG2D = {}) {
    let {
      from = 0,
      to = 100,
      nbPoints = 1001,
      peakWidthFct = () => 5,
      shape = {
        kind: 'gaussian',
      },
    } = options;

    from = ensureXYNumber(from);
    to = ensureXYNumber(to);
    nbPoints = ensureXYNumber(nbPoints);

    for (const axis of axis2D) {
      assertNumber(from[axis], `from-${axis}`);
      assertNumber(to[axis], `to-${axis}`);
      assertInteger(nbPoints[axis], `nbPoints-${axis}`);
    }

    this.from = from;
    this.to = to;
    this.nbPoints = nbPoints;
    this.interval = calculeIntervals(from, to, nbPoints);

    this.peakWidthFct = peakWidthFct;
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;

    let shapeGenerator = getShape2D(shape);
    this.shape = shapeGenerator;

    this.data = {
      x: new Float64Array(nbPoints.x),
      y: new Float64Array(nbPoints.y),
      z: createMatrix(this.nbPoints),
    };

    for (const axis of axis2D) {
      if (this.to[axis] <= this.from[axis]) {
        throw new RangeError('to option must be larger than from');
      }
    }

    if (typeof this.peakWidthFct !== 'function') {
      throw new TypeError('peakWidthFct option must be a function');
    }

    this.reset();
  }

  public addPeaks(peaks: Peak2D[] | Peak2DSeries, options?: AddPeak2DOptions) {
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
      let nbPeaks = peaks.x.length;
      for (const c of peakCoordinates) {
        if (peaks[c] && Array.isArray(peaks[c])) {
          if (nbPeaks !== peaks[c].length) {
            throw new Error('x, y, z should have the same length');
          }
        }
      }
      for (let i = 0; i < peaks.x.length; i++) {
        this.addPeak([peaks.x[i], peaks.y[i], peaks.z[i]], options);
      }
    }

    return this;
  }

  public addPeak(peak: Peak2D, options: AddPeak2DOptions = {}) {
    if (Array.isArray(peak) && peak.length < 3) {
      throw new Error(
        'peak must be an array with three (or four) values or an object with {x,y,z,width?}',
      );
    }

    if (
      !Array.isArray(peak) &&
      peakCoordinates.some((e) => peak[e] === undefined)
    ) {
      throw new Error(
        'peak must be an array with three (or four) values or an object with {x,y,z,width?}',
      );
    }

    let xPosition;
    let yPosition;
    let intensity;
    let peakFWHM;
    let peakWidth;
    let peakShapeOptions;
    if (Array.isArray(peak)) {
      [xPosition, yPosition, intensity, peakFWHM, peakShapeOptions] = peak;
    } else {
      xPosition = peak.x;
      yPosition = peak.y;
      intensity = peak.z;
      peakFWHM = peak.fwhm;
      peakWidth = peak.width;
      peakShapeOptions = peak.shape;
    }

    const position: XYNumber = { x: xPosition, y: yPosition };
    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let { shape: shapeOptions, width } = options;

    if (peakShapeOptions) {
      shapeOptions = shapeOptions
        ? { ...shapeOptions, ...peakShapeOptions }
        : peakShapeOptions;
    }

    if (shapeOptions) {
      this.shape = getShape2D(shapeOptions);
    }

    let {
      fwhm = peakFWHM !== undefined
        ? peakFWHM
        : peakWidth
        ? convertWidthToFWHM(this.shape, peakWidth)
        : width
        ? convertWidthToFWHM(this.shape, width)
        : this.peakWidthFct(xPosition, yPosition),
    } = options;

    fwhm = ensureXYNumber(fwhm);

    let factor =
      options.factor === undefined ? this.shape.getFactor() : options.factor;

    factor = ensureXYNumber(factor);

    const firstPoint: XYNumber = { x: 0, y: 0 };
    const lastPoint: XYNumber = { x: 0, y: 0 };
    for (const axis of axis2D) {
      const first = position[axis] - (fwhm[axis] / 2) * factor[axis];
      const last = position[axis] + (fwhm[axis] / 2) * factor[axis];
      firstPoint[axis] = Math.max(
        0,
        Math.floor((first - this.from[axis]) / this.interval[axis]),
      );
      lastPoint[axis] = Math.min(
        this.nbPoints[axis],
        Math.ceil((last - this.from[axis]) / this.interval[axis]),
      );
    }

    this.shape.fwhm = fwhm;
    for (let xIndex = firstPoint.x; xIndex < lastPoint.x; xIndex++) {
      for (let yIndex = firstPoint.y; yIndex < lastPoint.y; yIndex++) {
        const value =
          intensity *
          this.shape.fct(
            this.data.x[xIndex] - position.x,
            this.data.y[yIndex] - position.y,
          );
        if (value > 1e-6) {
          this.data.z[yIndex][xIndex] += value;
        }
      }
    }

    return this;
  }

  public getSpectrum(options: GetSpectrum2DOptions | boolean = {}) {
    if (typeof options === 'boolean') {
      options = { copy: options };
    }
    const { copy = true } = options;
    let minMaxZ = matrixMinMaxZ(this.data.z);

    return {
      minX: this.from.x,
      maxX: this.to.x,
      maxY: this.to.y,
      minY: this.from.y,
      minZ: minMaxZ.min,
      maxZ: minMaxZ.max,
      z: copy ? this.data.z.slice() : this.data.z,
    };
  }

  public reset() {
    const spectrum: Data2D = this.data;

    for (const axis of axis2D) {
      for (let i = 0; i < this.nbPoints[axis]; i++) {
        spectrum[axis][i] = this.from[axis] + i * this.interval[axis];
      }
    }
    for (let row of spectrum.z) {
      for (let j = 0; j < row.length; j++) {
        row[j] = 0;
      }
    }
    return this;
  }
}

export function generateSpectrum2D(
  peaks: Peak2D[] | Peak2DSeries,
  options: GenerateSpectrum2DOptions = {},
): Spectrum2D {
  const { generator: generatorOptions, peaks: addPeaksOptions } = options;

  const generator = new Spectrum2DGenerator(generatorOptions);

  generator.addPeaks(peaks, addPeaksOptions);
  return generator.getSpectrum();
}

function ensureXYNumber(input: number | XYNumber) {
  let result = typeof input !== 'object' ? { x: input, y: input } : input;
  return result;
}

function calculeIntervals(from: XYNumber, to: XYNumber, nbPoints: XYNumber) {
  return {
    x: (to.x - from.x) / (nbPoints.x - 1),
    y: (to.y - from.y) / (nbPoints.y - 1),
  };
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

function createMatrix(nbPoints: XYNumber) {
  const zMatrix = new Array(nbPoints.y);
  for (let i = 0; i < nbPoints.y; i++) {
    zMatrix[i] = new Float64Array(nbPoints.x);
  }
  return zMatrix;
}
