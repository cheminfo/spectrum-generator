import normed from 'ml-array-normed';
import { getShape } from 'ml-peak-shape-generator';

import addBaseline from './util/addBaseline.js';
import addNoise from './util/addNoise.js';

export class SpectrumGenerator {
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
          options: {
            fwhm: 1000,
            length: 5001,
          },
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
    this.shape = createShape(options.shape.kind, options.shape.options);

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
    if (Array.isArray(peak)) {
      [xPosition, intensity, peakWidth] = peak;
    } else {
      xPosition = peak.x;
      intensity = peak.y;
      peakWidth = peak.width;
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

    const shape = shapeOptions
      ? createShape(shapeOptions.kind, shapeOptions.options)
      : this.shape;

    if (!widthLeft) widthLeft = width;
    if (!widthRight) widthRight = width;

    const firstValue = xPosition - (widthLeft / 2) * shape.factor;
    const lastValue = xPosition + (widthRight / 2) * shape.factor;

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
    for (let index = firstPoint; index < middlePoint; index++) {
      let ratio = ((xPosition - this.data.x[index]) / widthLeft) * 2;
      let shapeIndex = Math.round(shape.halfLength - (ratio * shape.fwhm) / 2);
      if (shapeIndex >= 0 && shapeIndex < shape.data.length) {
        this.data.y[index] += shape.data[shapeIndex] * intensity;
      }
    }
    // we calculate the right part of the gaussian
    for (let index = middlePoint; index <= lastPoint; index++) {
      let ratio = ((this.data.x[index] - xPosition) / widthRight) * 2;

      let shapeIndex = Math.round(shape.halfLength - (ratio * shape.fwhm) / 2);
      if (shapeIndex >= 0 && shapeIndex <= shape.data.length) {
        this.data.y[index] += shape.data[shapeIndex] * intensity;
      }
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
  generator.addPeaks(peaks);
  if (options.baseline) generator.addBaseline(options.baseline);
  if (options.noise) generator.addNoise(options.noise.percent, options.noise);
  return generator.getSpectrum({
    threshold: options.threshold,
  });
}

function createShape(kind, options) {
  let shape = {};

  let newShape = getShape(kind, options);

  shape.data = normed(newShape.data, {
    algorithm: 'max',
  });
  shape.fwhm = newShape.fwhm;
  shape.factor = (newShape.data.length - 1) / newShape.fwhm;
  shape.length = newShape.data.length;
  shape.halfLength = Math.floor(newShape.data.length / 2);
  return shape;
}
