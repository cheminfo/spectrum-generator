# spectrum-generator

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Generate a spectrum from discrete peaks.

## Installation

`$ npm i spectrum-generator`

## Usage

The spectrum generator takes an array of discrete peaks (value and intensity)
and generates peaks with a gaussian distribution.

### generateSpectrum

```js
import { generateSpectrum } from 'spectrum-generator';

const peaks = [
  [4, 10],
  [20, 30],
  [236, 1],
  [569, 76],
];
const spectrum = generateSpectrum(peaks, { pointsPerUnit: 1 });
```

### class SpectrumGenerator

```js
import { SpectrumGenerator } from 'spectrum-generator';

const generator = new SpectrumGenerator();
generator.addPeak([5, 20]);
generator.addPeak([30, 56]);
generator.addPeaks([
  [40, 12],
  [10, 1],
]);
const spectrum = generator.getSpectrum();

generator.reset();
generator.addPeak([10, 50]);
const otherSpectrum = generator.getSpectrum();
```

## [API Documentation](https://cheminfo.github.io/spectrum-generator/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/spectrum-generator.svg
[npm-url]: https://www.npmjs.com/package/spectrum-generator
[ci-image]: https://github.com/cheminfo/spectrum-generator/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/cheminfo/spectrum-generator/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/spectrum-generator.svg
[download-url]: https://www.npmjs.com/package/spectrum-generator
