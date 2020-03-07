import normed from 'ml-array-normed';
import { getShape } from 'ml-peak-shape-generator';

import addBaseline from './util/addBaseline.js';
import addNoise from './util/addNoise.js';

export class SpectrumGenerator {
  constructor(options = {}) {
    options = Object.assign(
      {},
      {
        start: 0,
        end: 1000,
        pointsPerUnit: 5,
        peakWidthFct: () => 5,
        maxSize: 1e7,
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
    this.start = options.start;
    this.end = options.end;
    this.pointsPerUnit = options.pointsPerUnit;
    this.peakWidthFct = options.peakWidthFct;
    this.maxSize = options.maxSize;
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;
    this.shape = getShape(options.shape.kind, options.shape.options);
    this.shape.data = normed(this.shape.data, {
      algorithm: 'max',
    });
    this.shapeFactor = this.shape.data.length / this.shape.fwhm;

    assertInteger(this.start, 'start');
    assertInteger(this.end, 'end');
    assertInteger(this.pointsPerUnit, 'pointsPerUnit');
    assertInteger(this.maxSize, 'maxSize');

    if (this.end <= this.start) {
      throw new RangeError('end option must be larger than start');
    }

    if (typeof this.peakWidthFct !== 'function') {
      throw new TypeError('peakWidthFct option must be a function');
    }

    this.reset();
  }

  get size() {
    return (this.end - this.start) * this.pointsPerUnit + 1;
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
    if (!Array.isArray(peak) || peak.length !== 2) {
      throw new Error('peak must be an array with two values');
    }

    const [value, intensity] = peak;

    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let { width = this.peakWidthFct(value), widthLeft, widthRight } = options;

    if (!widthLeft) widthLeft = width;
    if (!widthRight) widthRight = width;

    const firstValue = value - (widthLeft / 2) * this.shapeFactor;
    const lastValue = value + (widthRight / 2) * this.shapeFactor;

    const firstPoint = Math.floor(firstValue * this.pointsPerUnit);
    const lastPoint = Math.ceil(lastValue * this.pointsPerUnit);
    const middlePoint = value * this.pointsPerUnit;

    // PEAK SHAPE MAY BE ASYMETRC (widthLeft and widthRight) !

    // we calculate the left part of the shape
    for (let j = firstPoint; j < middlePoint; j++) {
      let index = j - this.start * this.pointsPerUnit;

      if (index >= 0 && index < this.size) {
        let shapeIndex = Math.ceil(
          ((this.shape.fwhm / widthLeft) * (j - middlePoint)) /
            this.pointsPerUnit +
            (this.shapeFactor * this.shape.fwhm - 1) / 2,
        );

        if (shapeIndex >= 0 && shapeIndex < this.shape.data.length) {
          this.data.y[index] += this.shape.data[shapeIndex] * intensity;
        }
      }
    }
    // we calculate the right part of the gaussian
    for (let j = Math.ceil(middlePoint); j <= lastPoint; j++) {
      let index = j - this.start * this.pointsPerUnit;

      if (index >= 0 && index < this.size) {
        let shapeIndex = Math.floor(
          ((this.shape.fwhm / widthRight) * (j - middlePoint)) /
            this.pointsPerUnit +
            (this.shapeFactor * this.shape.fwhm - 1) / 2,
        );
        if (shapeIndex >= 0 && shapeIndex < this.shape.data.length) {
          this.data.y[index] += this.shape.data[shapeIndex] * intensity;
        }
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
    if (this.size > this.maxSize) {
      throw new Error(
        `Generated array has size ${this.size} larger than maxSize: ${this.maxSize}`,
      );
    }

    const spectrum = (this.data = {
      x: [],
      y: new Array(this.size).fill(0),
    });

    const interval = 1 / this.pointsPerUnit;
    const js = [];
    for (let j = 0; j < this.pointsPerUnit; j++) {
      js.push(j * interval);
    }

    for (let i = this.start; i < this.end; i++) {
      for (let j = 0; j < this.pointsPerUnit; j++) {
        spectrum.x.push(i + js[j]);
      }
    }

    spectrum.x.push(this.end);

    return this;
  }
}

function assertInteger(value, name) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} option must be an integer`);
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
