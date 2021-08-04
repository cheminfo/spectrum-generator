import { getShapeGenerator } from 'ml-peak-shape-generator';

import type { Data2D } from './types/data2D';
import type { peak, PeakSeries } from './types/peaks2D';
import type { Shape } from './types/shape';
import type { xyNumber } from './types/xyNumber';

type numToNumFn = (x: number, y?: number) => number | xyNumber;

interface OptionsSG1D {
  from?: number | xyNumber;
  to?: number | xyNumber;
  nbPoints?: number | xyNumber;
  peakWidthFct?: numToNumFn;
  maxPeakHeight?: number;
  shape?: Shape;
}

interface AddPeakOptions {
  width?: xyNumber;
  shape?: Shape;
  factor?: number | xyNumber;
}

interface GetSpectrum2DOptions {
  /**
   * generate a copy of the current data
   * @default true
   */
  copy?: boolean;
}

export class Spectrum2DGenerator {
  private from: xyNumber;
  private to: xyNumber;
  private nbPoints: xyNumber;
  public interval: xyNumber;
  private data: Data2D;
  private maxPeakHeight: number;
  private shape: any;
  private shapeParameters: any;
  private peakWidthFct: numToNumFn;

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
    let {
      from = 0,
      to = 100,
      nbPoints = 1001,
      peakWidthFct = () => 5,
      shape = {
        kind: 'gaussian2D',
      },
    } = options;

    from = checkObject(from);
    to = checkObject(to);
    nbPoints = checkObject(nbPoints);

    for (const axis of ['x', 'y']) {
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

    let shapeGenerator = getShapeGenerator(shape.kind);
    this.shape = shapeGenerator;
    this.shapeParameters = shape.options || {};

    this.data = {
      x: new Float64Array(nbPoints.x),
      y: new Float64Array(nbPoints.y),
      z: createMatrix(this.nbPoints),
    };

    for (const axis of ['x', 'y']) {
      if (this.to[axis] <= this.from[axis]) {
        throw new RangeError('to option must be larger than from');
      }
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
      let numberOfPeaks = peaks.x.length;
      for (const e of ['y', 'z']) {
        let data = peaks[e];
        if (data && Array.isArray(data)) {
          if (numberOfPeaks !== data.length) {
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

  public addPeak(peak: peak, options: AddPeakOptions = {}) {
    if (Array.isArray(peak) && peak.length < 3) {
      throw new Error(
        'peak must be an array with three (or four) values or an object with {x,y,z,width?}',
      );
    }

    if (
      !Array.isArray(peak) &&
      ['x', 'y', 'z'].some((e) => peak[e] === undefined)
    ) {
      throw new Error(
        'peak must be an array with three (or four) values or an object with {x,y,z,width?}',
      );
    }

    let xPosition;
    let yPosition;
    let intensity;
    let peakWidth;
    let peakShapeOptions;
    if (Array.isArray(peak)) {
      [xPosition, yPosition, intensity, peakWidth, peakShapeOptions] = peak;
    } else {
      xPosition = peak.x;
      yPosition = peak.y;
      intensity = peak.z;
      peakWidth = peak.width;
      peakShapeOptions = peak.shape;
    }

    const position: xyNumber = { x: xPosition, y: yPosition };

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let {
      width = peakWidth === undefined
        ? this.peakWidthFct(xPosition, yPosition)
        : peakWidth,
      shape: shapeOptions = {},
    } = options;

    if (peakShapeOptions) {
      Object.assign(shapeOptions, peakShapeOptions || {});
    }

    const { kind } = shapeOptions;

    const shapeGenerator = kind ? getShapeGenerator(kind) : this.shape;
    const shapeParameters = shapeOptions?.options || this.shapeParameters;

    if (typeof width !== 'object') {
      width = { x: width, y: width };
    }

    let factor =
      options.factor === undefined
        ? shapeGenerator.getFactor()
        : options.factor;

    factor = checkObject(factor);

    const firstPoint: any = {};
    const lastPoint: any = {};
    for (const axis of ['x', 'y']) {
      const first = position[axis] - (width[axis] / 2) * factor[axis];
      const last = position[axis] + (width[axis] / 2) * factor[axis];

      firstPoint[axis] = Math.max(
        0,
        Math.floor((first - this.from[axis]) / this.interval[axis]),
      );
      lastPoint[axis] = Math.min(
        this.nbPoints[axis],
        Math.ceil((last - this.from[axis]) / this.interval[axis]),
      );
    }

    if (!shapeParameters.fwhm) shapeParameters.fwhm = {};
    for (const axis in width) {
      shapeParameters.fwhm[axis] = width[axis];
    }
    let shapeFct = shapeGenerator.curry(shapeParameters);
    for (let xIndex = firstPoint.x; xIndex < lastPoint.x; xIndex++) {
      for (let yIndex = firstPoint.y; yIndex < lastPoint.y; yIndex++) {
        this.data.z[xIndex][yIndex] +=
          intensity *
          shapeFct(
            this.data.x[xIndex] - position.x,
            this.data.y[yIndex] - position.y,
          );
      }
    }

    return this;
  }

  public getSpectrum(options: GetSpectrum2DOptions | boolean = {}) {
    if (typeof options === 'boolean') {
      options = { copy: options };
    }
    const { copy = true } = options;
    let [minX, maxX] = [this.data.x[0], this.data.x[this.nbPoints.x - 1]];
    let [minY, maxY] = [this.data.y[0], this.data.y[this.nbPoints.y - 1]];
    if (copy) {
      return {
        minX,
        maxX,
        maxY,
        minY,
        z: this.data.z.slice(),
      };
    } else {
      return {
        minX,
        maxX,
        maxY,
        minY,
        z: this.data.z,
      };
    }
  }

  public reset() {
    const spectrum: Data2D = this.data;

    for (const axis of ['x', 'y']) {
      for (let i = 0; i < this.nbPoints[axis]; i++) {
        spectrum[axis][i] = this.from[axis] + i * this.interval[axis];
      }
    }
    return this;
  }
}

function checkObject(input: number | xyNumber) {
  let result = typeof input !== 'object' ? { x: input, y: input } : input;
  return result;
}

function calculeIntervals(from: xyNumber, to: xyNumber, nbPoints: xyNumber) {
  const intervals: any = {};
  for (const axis in from) {
    intervals[axis] = (to[axis] - from[axis]) / (nbPoints[axis] - 1);
  }
  return intervals;
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

function createMatrix(nbPoints: xyNumber) {
  const zMatrix = new Array(nbPoints.x);
  for (let i = 0; i < nbPoints.x; i++) {
    zMatrix[i] = new Float64Array(nbPoints.y);
  }
  return zMatrix;
}
