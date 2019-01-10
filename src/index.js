import addBaseline from './util/addBaseline.js';
import addNoise from './util/addNoise.js';

const gaussianFactor = 5; // after 5 the value is nearly 0, nearly no artifacts
const gaussianWidth = 1000; // half height peak Width in point
const gaussian = [];
const ratio = Math.sqrt(Math.log(4));
for (let i = 0; i <= gaussianWidth * gaussianFactor; i++) {
  gaussian.push(
    Math.exp(
      (-1 / 2) *
        Math.pow(
          (((i - (gaussianFactor * gaussianWidth) / 2) * 2) / gaussianWidth) *
            ratio,
          2
        )
    )
  );
}

export class SpectrumGenerator {
  /**
   * @class SpectrumGenerator
   * @constructor
   * @param {object} [options={}]
   * @param {number} [options.start=0] - First x value (inclusive)
   * @param {number} [options.end=1000] - Last x value (inclusive)
   * @param {function} [options.peakWidthFct=function(x){return(5)}] - Width of peak depending the x value
   * @param {number} [options.pointsPerUnit=5] - Number of values between each unit of the x axis
   * @param {number} [options.maxSize=1e7] - maximal array size
   *
   * @example
   * import SG from 'spectrum-generator';
   * const sg = new SG({start: 0, end: 100, pointsPerUnit: 5, peakWidthFct: (x) => 1 + 3 * x / 1000 });
   * sg.addPeak( [5, 50] );
   * sg.addPeak([20, 100], { width: 3 });
   * sg.addPeak([35, 100], { widthLeft: 10, widthRight: 30 });
   * sg.addPeak([50, 10], { widthLeft: 5, widthRight: 5 });
   * sg.addPeaks([ [70,20], [80,40], [90,10] ]);
   * sg.addNoise(10);
   * sg.addBaseline( (x) => x * x / 100 );
   * var spectrum = sg.getSpectrum();
   *
   * @example
   * import SG from 'spectrum-generator';
   * const spectrum=SG.generateSpectrum([ [20,3], [30,2], [40,2] ], {
   *  start: 0,
   *  end: 100,
   *  pointsPerUnit: 1,
   *  noise: {
   *    percent: 10,
   *    distribution: 'normal',
   *    seed: 42
   *  },
   *  baseline: (x) => 2 * x,
   * })
   */
  constructor(options = {}) {
    options = Object.assign(
      {},
      {
        start: 0,
        end: 1000,
        pointsPerUnit: 5,
        peakWidthFct: () => 5,
        maxSize: 1e7
      },
      options
    );
    this.start = options.start;
    this.end = options.end;
    this.pointsPerUnit = options.pointsPerUnit;
    this.peakWidthFct = options.peakWidthFct;
    this.maxSize = options.maxSize;
    this.maxPeakHeight = Number.MIN_SAFE_INTEGER;

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

  /**
   * Add a series of peaks to the spectrum.
   * @param {Array<Array<number>>} peaks
   * @return {this}
   */
  addPeaks(peaks) {
    if (!Array.isArray(peaks)) {
      throw new TypeError('peaks must be an array');
    }
    for (const peak of peaks) {
      this.addPeak(peak);
    }
    return this;
  }

  /**
   * Add a single peak to the spectrum.
   * @param {Array<number>} peak
   * @param {object} [options={}]
   * @param {number} [options.width] Half-height width
   * @param {number} [options.widthLeft] Half-height width left (asymmetric peak)
   * @param {number} [options.widthRight] Half-height width right (asymmetric peak)
   * @return {this}
   */
  addPeak(peak, options = {}) {
    if (!Array.isArray(peak) || peak.length !== 2) {
      throw new Error('peak must be an array with two values');
    }

    const value = peak[0];
    const intensity = peak[1];
    if (intensity > this.maxPeakHeight) this.maxPeakHeight = intensity;

    let { width = this.peakWidthFct(value), widthLeft, widthRight } = options;

    if (!widthLeft) widthLeft = width;
    if (!widthRight) widthRight = width;

    const firstValue = value - (widthLeft / 2) * gaussianFactor;
    const lastValue = value + (widthRight / 2) * gaussianFactor;

    const firstPoint = Math.floor(firstValue * this.pointsPerUnit);
    const lastPoint = Math.ceil(lastValue * this.pointsPerUnit);
    const middlePoint = value * this.pointsPerUnit;

    // we calculate the left part of the gaussian
    for (let j = firstPoint; j < middlePoint; j++) {
      let index = j - this.start * this.pointsPerUnit;
      if (index >= 0 && index < this.size) {
        let gaussianIndex = Math.floor(
          ((gaussianWidth / widthLeft) * (j - middlePoint)) /
            this.pointsPerUnit +
            (gaussianFactor * gaussianWidth) / 2
        );
        if (gaussianIndex >= 0 && gaussianIndex < gaussian.length) {
          this.data.y[index] += gaussian[gaussianIndex] * intensity;
        }
      }
    }

    // we calculate the right part of the gaussian
    for (let j = Math.ceil(middlePoint); j <= lastPoint; j++) {
      let index = j - this.start * this.pointsPerUnit;
      if (index >= 0 && index < this.size) {
        let gaussianIndex = Math.floor(
          ((gaussianWidth / widthRight) * (j - middlePoint)) /
            this.pointsPerUnit +
            (gaussianFactor * gaussianWidth) / 2
        );
        if (gaussianIndex >= 0 && gaussianIndex < gaussian.length) {
          this.data.y[index] += gaussian[gaussianIndex] * intensity;
        }
      }
    }

    return this;
  }

  addBaseline(baselineFct) {
    addBaseline(this.data, baselineFct);
  }

  addNoise(percent, options) {
    addNoise(this.data, percent, options);
  }

  /**
   * Get the generated spectrum.
   *     @param {object} [options={}]
   * @param {number} [options.threshold=0] - minimal ratio of Y to keep the value
   * @param {boolean} [options.copy=true] - If true, returns a copy of the spectrum.
   * Otherwise, return the internal value that can be mutated if subsequent calls to addPeak are made.
   * @return {object}
   */
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
        y: this.data.y.slice()
      };
    } else {
      return this.data;
    }
  }

  /**
   * Resets the generator with an empty spectrum.
   * @return {this}
   */
  reset() {
    if (this.size > this.maxSize) {
      throw new Error(
        `Generated array has size ${this.size} larger than maxSize: ${
          this.maxSize
        }`
      );
    }

    const spectrum = (this.data = {
      x: [],
      y: new Array(this.size).fill(0)
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

/**
 * Generates a spectrum and returns it
 * @param {Array<Array<number>>} peaks - list of peaks to put in the spectrum
 * @param {object} [options] - same options as new SpectrumGenerator
 * @return {object} spectrum
 */
export function generateSpectrum(peaks, options = {}) {
  const generator = new SpectrumGenerator(options);
  generator.addPeaks(peaks);
  if (options.baseline) generator.addBaseline(options.baseline);
  if (options.noise) generator.addNoise(options.noise.percent, options.noise);
  return generator.getSpectrum({
    threshold: options.threshold
  });
}
