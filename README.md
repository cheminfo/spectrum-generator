# spectrum-generator

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][codecov-image]][codecov-url]
  [![npm download][download-image]][download-url]

generate a spectrum from discrete peaks.

## Installation

`$ npm install --save spectrum-generator`

## Usage

The spectrum generator takes an array of discrete peaks (value and intensity)
and generates peaks with a gaussian distribution.

### generateSpectrum

```js
import {generateSpectrum} from 'spectrum-generator';

const peaks = [[4, 10], [20, 30], [236, 1], [569, 76]];
const spectrum = generateSpectrum(peaks, {pointsPerUnit: 1});
```
### class SpectrumGenerator

```js
import {SpectrumGenerator} from 'spectrum-generator';

const generator = new SpectrumGenerator();
generator.addPeak([5, 20]);
generator.addPeak([30, 56]);
generator.addPeaks([[40, 12], [10, 1]]);
const spectrum = generator.getSpectrum();

generator.reset();
generator.addPeak([10, 50]);
const otherSpectrum = generator.getSpectrum();
```

## [API Documentation](https://cheminfo.github.io/spectrum-generator/)

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/spectrum-generator.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/spectrum-generator
[travis-image]: https://img.shields.io/travis/cheminfo/spectrum-generator/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/cheminfo/spectrum-generator
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/spectrum-generator.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/cheminfo/spectrum-generator
[download-image]: https://img.shields.io/npm/dm/spectrum-generator.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/spectrum-generator
