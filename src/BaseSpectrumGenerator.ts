import { getShape1D } from 'ml-peak-shape-generator';
import type { Shape1D, Shape1DInstance } from 'ml-peak-shape-generator';

import type { Peak1D } from './types/Peaks1D.ts';

export type NumToNumFn = (x: number) => number;

export interface OptionsSG1D {
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

export interface PeakOptions {
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
   * Number of times of fwhm to calculate length.
   * @default 'covers 99.99 % of surface'
   */
  factor?: number;
}

export interface ResolvedPeak {
  x0: number;
  intensity: number;
  shapeLeft: Shape1DInstance;
  shapeRight: Shape1DInstance;
  widthLeft: number;
  widthRight: number;
  factor: number;
}

export class BaseSpectrumGenerator {
  protected from: number;
  protected to: number;
  protected nbPoints: number;
  public interval: number;
  protected peakWidthFct: NumToNumFn | undefined;
  protected shape: Shape1DInstance;

  public constructor(options: OptionsSG1D = {}) {
    const {
      from = 0,
      to = 1000,
      nbPoints = 10001,
      peakWidthFct,
      shape = { kind: 'gaussian', fwhm: 5 },
    } = options;

    assertNumber(from, 'from');
    assertNumber(to, 'to');
    assertInteger(nbPoints, 'nbPoints');

    if (to <= from) {
      throw new RangeError('to option must be larger than from');
    }
    if (peakWidthFct && typeof peakWidthFct !== 'function') {
      throw new TypeError('peakWidthFct option must be a function');
    }

    this.from = from;
    this.to = to;
    this.nbPoints = nbPoints;
    this.interval = (to - from) / (nbPoints - 1);
    this.peakWidthFct = peakWidthFct;
    this.shape = getShape1D(shape);
  }

  /**
   * Resolves a peak to its canonical parameters, cloning and configuring
   * separate shape instances for the left and right halves.
   */
  protected resolvePeak(peak: Peak1D, options: PeakOptions): ResolvedPeak {
    let x0: number;
    let intensity: number;
    let peakFWHM: number | undefined;
    let peakWidth: number | undefined;
    let peakShapeOptions: Shape1D | undefined;

    if (Array.isArray(peak)) {
      [x0, intensity, peakFWHM, peakShapeOptions] = peak;
    } else {
      x0 = peak.x;
      intensity = peak.y;
      peakWidth = peak.width;
      peakShapeOptions = peak.shape;
    }

    let { shape: shapeOptions } = options;
    if (peakShapeOptions) {
      shapeOptions = shapeOptions
        ? { ...shapeOptions, ...peakShapeOptions }
        : peakShapeOptions;
    }

    const shape = shapeOptions
      ? getShape1D(shapeOptions)
      : cloneShape(this.shape);

    const { width } = options;
    let { widthLeft, widthRight } = options;

    const fwhm =
      peakFWHM !== undefined
        ? peakFWHM
        : peakWidth
          ? shape.widthToFWHM(peakWidth)
          : this.peakWidthFct
            ? this.peakWidthFct(x0)
            : width !== undefined
              ? width
              : shape.fwhm;

    if (!widthLeft) widthLeft = fwhm;
    if (!widthRight) widthRight = fwhm;

    if (!widthLeft || !widthRight) {
      throw new Error('Width left or right is undefined or zero');
    }

    const factor =
      options.factor === undefined ? shape.getFactor() : options.factor;

    const shapeLeft = cloneShape(shape);
    shapeLeft.fwhm = widthLeft;

    const shapeRight = cloneShape(shape);
    shapeRight.fwhm = widthRight;

    return {
      x0,
      intensity,
      shapeLeft,
      shapeRight,
      widthLeft,
      widthRight,
      factor,
    };
  }
}

function cloneShape(shape: Shape1DInstance): Shape1DInstance {
  return Object.assign(
    Object.create(Object.getPrototypeOf(shape)),
    shape,
  ) as Shape1DInstance;
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
