import { Matrix } from 'ml-matrix';
import { getShapeGenerator } from 'ml-peak-shape-generator';

import type { Shape } from './types/shape';
import type { Data2D } from './types/Data2D';
import type { peak } from './types/peaks2D';
import type { xyNumber } from './types/xyNumber';

type numToNumFn = (x?: number, y?: number) => xyNumber;

interface OptionsSG1D {
  from?: xyNumber;
  to?: xyNumber;
  nbPoints?: xyNumber;
  interval?: xyNumber;
  peakWidthFct?: numToNumFn;
  maxPeakHeight?: number;
  shape?: Shape;
}

interface AddPeakOptions {
  width?: xyNumber;
  shape?: Shape;
  factor?: xyNumber;
}

export class SpectrumGenerator2D {
  private from: xyNumber;
  private to: xyNumber;
  private nbPoints: xyNumber;
  private interval: xyNumber;
  private data: Data2D;
  private maxPeakHeight: number;
  private shape: (options: Shape) => any;
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
  constructor(options: OptionsSG1D = {}) {
    const {
      from = { x: 0, y: 0 },
      to = { x: 10, y: 10 },
      nbPoints = { x: 128, y: 128 },
      peakWidthFct = () => ({ x: 5, y: 5 }),
      shape = {
        kind: 'gaussian2D',
      },
    } = options;

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

    let shapeGenerator = getShapeGenerator(shape);
    this.shape = shapeGenerator;

    this.data = {
      x: new Float64Array(nbPoints.x),
      y: new Float64Array(nbPoints.y),
      z: new Matrix(this.nbPoints.x, this.nbPoints.y).to2DArray(),
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

  addPeak(peak: peak, options: AddPeakOptions = {}) {
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
      shape: shapeOptions,
    } = options;

    if (peakShapeOptions) {
      Object.assign(shapeOptions || {}, peakShapeOptions || {});
    }

    let shapeGenerator = shapeOptions
      ? getShapeGenerator(shapeOptions)
      : this.shape;

    if (typeof width !== 'object') {
      width = { x: width, y: width };
    }

    let factor =
      options.factor === undefined
        ? shapeGenerator.getFactor()
        : options.factor;

    const firstPoint: any = {};
    const lastPoint: any = {};
    for (const axis of ['x', 'y']) {
      const first = position[axis] - (width[axis] / 2) * factor;
      const last = position[axis] + (width[axis] / 2) * factor;
      firstPoint[axis] = Math.max(
        0,
        Math.floor((first - this.from[axis]) / this.interval[axis]),
      );
      lastPoint[axis] = Math.min(
        this.nbPoints[axis] - 1,
        Math.ceil((last - this.from[axis]) / this.interval[axis]),
      );
    }

    for (const axis in width) {
      shapeGenerator.setFWHM(width[axis], axis);
    }

    for (let xIndex = firstPoint.x; xIndex < lastPoint.x; xIndex++) {
      for (let yIndex = firstPoint.y; yIndex < lastPoint.y; yIndex++) {
        this.data.z[xIndex][yIndex] +=
          intensity *
          shapeGenerator.fct(
            this.data.x[xIndex] - position.x,
            this.data.y[yIndex] - position.y,
          );
      }
    }

    return this;
  }

  reset() {
    const spectrum: Data2D = (this.data = {
      x: new Float64Array(this.nbPoints.x),
      y: new Float64Array(this.nbPoints.y),
      z: new Matrix(this.nbPoints.x, this.nbPoints.y).to2DArray(),
    });

    for (const axis of ['x', 'y']) {
      for (let i = 0; i < this.nbPoints[axis]; i++) {
        spectrum[axis][i] = this.from[axis] + i * this.interval[axis];
      }
    }
    return this;
  }
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
