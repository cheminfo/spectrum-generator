# spectrum-generator

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Generates a spectrum from discrete peaks. The shape of the peaks can be customised.

In order to increase the speed a `shape` is first generated and then the peaks in the final
spectrum are resulting from sampling the `shape`.  A `shape` will therefore be generated with
much more points (typically fwhm:1000).


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
const spectrum = generateSpectrum(peaks, { 
  from: 0, // default value: 0
  to: 1000,  // default value: 1000
  nbPoints: 10001 // default value: 10001
});
```

Example to generate a high resolution spectrum using lorentzian peaks shape

```js
import { generateSpectrum } from 'spectrum-generator';

const peaks = [
  [1, 10],
  [2, 30],
  [3, 1],
  [4, 76],
];
const spectrum = generateSpectrum(peaks, {
  nbPoints: 1001,
  from: 0,
  to: 10,
  shape: {
    kind: 'lorentzian',
    options: {
      fwhm: 1000,
      length: 10001,
    }
  }
});



```

### class SpectrumGenerator

```js
import { SpectrumGenerator } from 'spectrum-generator';

const generator = new SpectrumGenerator();
generator.addPeak([5, 20]);
generator.addPeak({x: 5, y:20}); // we may either add an array of 2 elements or an object with x,y values
generator.addPeak([30, 56]);
generator.addPeaks([
  [40, 12], // it can also be an array of objects with x,y properties
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



BREAKING CHANGES

The current code was not dealing correctly with X scale that is not unit based. It was
mainly designed for gas chromatography where X axis is defined in 's'.

The way the spectrum is generated was completely rewritten to be more general and simpler to use.

- rename `start` to `from`
- rename `end` to `to`
- addPeak should be of kind {x,y} instead of [x,y]
- remove pointsPerUnit. Need to specify nbPoints now
- returns a spectrum {x:Float64Array, y:Float64Array}