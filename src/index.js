import addBaseline from './functionalities/addBaseline.js';
import addNoise from './functionalities/addNoise.js';


const gaussianFactor = 5; // after 5 the value is nearly 0, nearly no artifacts
const gaussianWidth = 1000; // half height peak Width in point
const gaussian = [];
const ratio = Math.sqrt(Math.log(4));
for (let i = 0; i <= gaussianWidth * gaussianFactor; i++) {
  gaussian.push(Math.exp(-1 / 2 * Math.pow((i - (gaussianFactor * gaussianWidth / 2)) * 2 / gaussianWidth * ratio, 2)));
}


export default class SpectrumGenerator {
  /**
     * @class SpectrumGenerator
     * @constructor
     * @param {object} [options]
     * @param {number} [options.start=0] - First x value (inclusive)
     * @param {number} [options.end=1000] - Last x value (inclusive)
     * @param {number} [options.pointsPerUnit=5] - Number of values between each unit of the x axis
     * @param {number} [options.maxSize=1e7] - maximal array size
     * @param {function} [options.peakWidthFct] - Returns the width of a peak for a given value. Defaults to (1 + 3 * value / 1000)
     * @param {function} [options.baseline] - Mathematical function producing the baseline you want
     * @param {number} [options.noise = 0] - Noise's amplitude in percents of the spectrum max value
     *
     * @example
     * import SG from 'spectrum-generator';
     * const sg = new SG({ start: 0, end: 100, pointsPerUnit: 1 });
     * sg.addPeak(1,2);
     * sg.addPeaks([ [2,3], [3,2], [4,2] ]);
     * sg.addNoise(10);
     * sg.addBaseline( (x) => 2 * x );
     * var spectrum = sg.getSpectrum();
     *
     * @example
     * import SG from 'spectrum-generator';
     * const spectrum=SG.generateSpectrum([ [2,3], [3,2], [4,2] ], {
     *  start: 0,
     *  end: 100,
     *  pointsPerUnit: 1,
     *  noise: {
     *    percent: 10,
     *    distribution: 'normal',
     *    seed: true
     *  },
     *  baseline: (x) => 2 * x
     * })
     */
  constructor(options = {}) {
    this.start = options.start || 0;
    this.end = options.end || 1000;
    this.pointsPerUnit = options.pointsPerUnit || 5;
    this.peakWidthFct = options.peakWidthFct || ((x) => 1 + 3 * x / 1000);
    this.maxSize = options.maxSize || 1e7;

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

    if (typeof this.baseline !== 'function') {
      throw new TypeError('baseline option must be a function');
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
     * @return {this}
     */
  addPeak(peak) {
    if (!Array.isArray(peak) || peak.length !== 2) {
      throw new Error('peak must be an array with two values');
    }

    const value = peak[0];
    const intensity = peak[1];
    const width = this.peakWidthFct(value);
    const firstValue = value - (width / 2 * gaussianFactor);
    const lastValue = value + (width / 2 * gaussianFactor);

    const firstPoint = Math.floor(firstValue * this.pointsPerUnit);
    const lastPoint = Math.ceil(lastValue * this.pointsPerUnit);
    const middlePoint = (firstPoint + lastPoint) / 2;

    for (var j = firstPoint; j <= lastPoint; j++) {
      var index = j - this.start * this.pointsPerUnit;
      if (index >= 0 && index < this.size) {
        var gaussianIndex = Math.floor(gaussianWidth / width * (j - middlePoint) / this.pointsPerUnit + gaussianFactor * gaussianWidth / 2);
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
     * @param {boolean} [copy=true] - If true, returns a copy of the spectrum.
     * Otherwise, return the internal value that can be mutated if subsequent calls to addPeak are made.
     * @return {object}
     */
  getSpectrum(copy = true) {
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
      throw new Error(`Generated array has size ${this.size} larger than maxSize: ${this.maxSize}`);
    }

    const spectrum = this.data = {
      x: [],
      y: new Array(this.size).fill(0)
    };

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
SpectrumGenerator.generateSpectrum(peaks, options = {}) {
  const generator = new SpectrumGenerator(options);
  generator.addPeaks(peaks);
  generator.addBaseline(options.baseline);
  generator.addNoise(options);
  return generator.getSpectrum();
}
