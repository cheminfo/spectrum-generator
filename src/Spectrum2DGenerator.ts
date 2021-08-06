import { getShape2D } from 'ml-peak-shape-generator';
import type { Shape2DKind, Shape2D } from 'ml-peak-shape-generator';

import type { Data2D } from './types/Data2D';
import type { peak, PeakSeries } from './types/Peaks2D';
import type { Shape2DOption } from './types/Shape2DOption';
import type { XYNumber } from './types/XYNumber';

type numToNumFn = (x: number, y?: number) => number | XYNumber;

type Axis2D = 'x' | 'y';
const axis2D: Axis2D[] = ['x', 'y'];

type PeakCoordinates = 'x' | 'y' | 'z';
const peakCoordinates: PeakCoordinates[] = ['x', 'y', 'z'];

interface OptionsSG1D {
  from?: number | XYNumber;
  to?: number | XYNumber;
  nbPoints?: number | XYNumber;
  peakWidthFct?: numToNumFn;
  maxPeakHeight?: number;
  shape?: Shape2DOption;
}

interface AddPeakOptions {
  width?: XYNumber;
  shape?: Shape2DOption;
  factor?: number | XYNumber;
}

interface GetSpectrum2DOptions {
  /**
   * generate a copy of the current data
   * @default true
   */
  copy?: boolean;
}

export class Spectrum2DGenerator {
  private from: XYNumber;
  private to: XYNumber;
  private nbPoints: XYNumber;
  public interval: XYNumber;
  private data: Data2D;
  private maxPeakHeight: number;
  private shape: Shape2D;
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

    const kind = shape.kind as Shape2DKind;
    const { options: shapeOptions = {} } = shape;
    let shapeGenerator = getShape2D(kind, shapeOptions);
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
      peakCoordinates.some((e) => peak[e] === undefined)
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

    const position: XYNumber = { x: xPosition, y: yPosition };

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let {
      width = peakWidth === undefined
        ? this.peakWidthFct(xPosition, yPosition)
        : peakWidth,
      shape: shapeOptions,
    } = options;

    if (peakShapeOptions) {
      shapeOptions = shapeOptions
        ? { ...shapeOptions, ...peakShapeOptions }
        : peakShapeOptions;
    }

    if (shapeOptions) {
      const kind = shapeOptions.kind as Shape2DKind;
      const { options: shapeParameters = {} } = shapeOptions;
      this.shape = getShape2D(kind, shapeParameters);
    }

    if (typeof width !== 'object') {
      width = { x: width, y: width };
    }

    let factor =
      options.factor === undefined ? this.shape.getFactor() : options.factor;

    factor = ensureXYNumber(factor);

    const firstPoint: XYNumber = { x: 0, y: 0 };
    const lastPoint: XYNumber = { x: 0, y: 0 };
    for (const axis of axis2D) {
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

    this.shape.fwhmX = width.x;
    this.shape.fwhmY = width.y;
    for (let xIndex = firstPoint.x; xIndex < lastPoint.x; xIndex++) {
      for (let yIndex = firstPoint.y; yIndex < lastPoint.y; yIndex++) {
        this.data.z[xIndex][yIndex] +=
          intensity *
          this.shape.fct(
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

    for (const axis of axis2D) {
      for (let i = 0; i < this.nbPoints[axis]; i++) {
        spectrum[axis][i] = this.from[axis] + i * this.interval[axis];
      }
    }
    return this;
  }
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
  const zMatrix = new Array(nbPoints.x);
  for (let i = 0; i < nbPoints.x; i++) {
    zMatrix[i] = new Float64Array(nbPoints.y);
  }
  return zMatrix;
}
