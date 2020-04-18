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
    this.shape = getShape(options.shape.kind, options.shape.options);
    this.shape.data = normed(this.shape.data, {
      algorithm: 'max',
    });
    this.shapeFactor = (this.shape.data.length - 1) / this.shape.fwhm;
    this.shapeLength = this.shape.data.length;
    this.shapeHalfLength = Math.floor(this.shape.data.length / 2);
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

  addPeaks(peaks) {
    if (!Array.isArray(peaks)) {
      throw new TypeError('peaks must be an array');
    }
    for (const peak of peaks) {
      this.addPeak(peak);
    }
    return this;
  }

  addPeak(peak, options = {}) {
    if (
      typeof peak !== 'object' ||
      (peak.length !== 2 && (peak.x === undefined || peak.y === undefined))
    ) {
      throw new Error(
        'peak must be an array with two values or an object with {x,y}',
      );
    }
    let xPosition;
    let intensity;
    if (Array.isArray(peak)) {
      [xPosition, intensity] = peak;
    } else {
      xPosition = peak.x;
      intensity = peak.y;
    }

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let {
      width = this.peakWidthFct(xPosition),
      widthLeft,
      widthRight,
    } = options;

    if (!widthLeft) widthLeft = width;
    if (!widthRight) widthRight = width;

    const firstValue = xPosition - (widthLeft / 2) * this.shapeFactor;
    const lastValue = xPosition + (widthRight / 2) * this.shapeFactor;

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
      let shapeIndex = Math.round(
        this.shapeHalfLength - (ratio * this.shape.fwhm) / 2,
      );
      if (shapeIndex >= 0 && shapeIndex < this.shape.data.length) {
        this.data.y[index] += this.shape.data[shapeIndex] * intensity;
      }
    }
    // we calculate the right part of the gaussian
    for (let index = middlePoint; index <= lastPoint; index++) {
      let ratio = ((this.data.x[index] - xPosition) / widthRight) * 2;

      let shapeIndex = Math.round(
        this.shapeHalfLength - (ratio * this.shape.fwhm) / 2,
      );
      if (shapeIndex >= 0 && shapeIndex <= this.shape.data.length) {
        this.data.y[index] += this.shape.data[shapeIndex] * intensity;
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
