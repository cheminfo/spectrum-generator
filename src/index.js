import { getShapeGenerator } from 'ml-peak-shape-generator';

import addBaseline from './util/addBaseline.js';
import addNoise from './util/addNoise.js';

export class SpectrumGenerator {
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
  constructor(options = {}) {
    options = Object.assign(
      {},
      {
        from: 0,
        to: 1000,
        nbPoints: 10001,
        peakWidthFct: () => 5,
        shape: {
          kind: 'gaussian',
        },
      },
      options,
    );

    this.from = options.from;
    this.to = options.to;
    this.nbPoints = options.nbPoints;
    this.interval = (this.to - this.from) / (this.nbPoints - 1);
    this.peakWidthFct = options.peakWidthFct;
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;

    let shapeGenerator = getShapeGenerator(options.shape);
    this.shape = shapeGenerator;

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

  addPeaks(peaks, options) {
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
   *
   * @param {[x,y]|[x,y,w]|{x,y,width}} [peak]
   * @param {*} options
   */
  addPeak(peak, options = {}) {
    if (
      typeof peak !== 'object' ||
      (peak.length !== 2 &&
        peak.length !== 3 &&
        (peak.x === undefined || peak.y === undefined))
    ) {
      throw new Error(
        'peak must be an array with two (or three) values or an object with {x,y,width?}',
      );
    }

    let xPosition;
    let intensity;
    let peakWidth;
    let gaussianRatio;
    if (Array.isArray(peak)) {
      [xPosition, intensity, peakWidth, gaussianRatio] = peak;
    } else {
      xPosition = peak.x;
      intensity = peak.y;
      peakWidth = peak.width;
      gaussianRatio = peak.mu;
    }

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let {
      width = peakWidth === undefined
        ? this.peakWidthFct(xPosition)
        : peakWidth,
      widthLeft,
      widthRight,
      shape: shapeOptions,
    } = options;

    let shapeGenerator = shapeOptions
      ? getShapeGenerator(shapeOptions)
      : this.shape;

    if (gaussianRatio !== undefined) shapeGenerator.setMu(gaussianRatio);

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

    shapeGenerator.setFWHM(widthLeft);
    for (let index = firstPoint; index < Math.max(middlePoint, 0); index++) {
      this.data.y[index] +=
        intensity * shapeGenerator.fct(this.data.x[index] - xPosition);
    }

    // we calculate the right part of the gaussian
    shapeGenerator.setFWHM(widthRight);
    for (
      let index = Math.min(middlePoint, lastPoint);
      index <= lastPoint;
      index++
    ) {
      this.data.y[index] +=
        intensity * shapeGenerator.fct(this.data.x[index] - xPosition);
    }

    return this;
  }

  addBaseline(baselineFct) {
    addBaseline(this.data, baselineFct);
    return this;
  }

  addNoise(percent, options) {
    addNoise(this.data, percent, options);
    return this;
  }

  getSpectrum(options = {}) {
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

  reset() {
    const spectrum = (this.data = {
      x: new Float64Array(this.nbPoints),
      y: new Float64Array(this.nbPoints),
    });

    for (let i = 0; i < this.nbPoints; i++) {
      spectrum.x[i] = this.from + i * this.interval;
    }

    return this;
  }
}

function assertInteger(value, name) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} option must be an integer`);
  }
}

function assertNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} option must be a number`);
  }
}

export function generateSpectrum(peaks, options = {}) {
  const generator = new SpectrumGenerator(options);

  generator.addPeaks(peaks, options);
  if (options.baseline) generator.addBaseline(options.baseline);
  if (options.noise) generator.addNoise(options.noise.percent, options.noise);
  return generator.getSpectrum({
    threshold: options.threshold,
  });
}
