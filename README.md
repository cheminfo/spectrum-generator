# spectrum-generator

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Generates a spectrum from discrete peaks. The shape of the peaks can be customized.

The shape is generated using [ml-peak-shape-generator](https://github.com/mljs/peak-shape-generator) and you may use all the corresponding [options](https://mljs.github.io/peak-shape-generator/#getshape) of getShape.

## Installation

`$ npm i spectrum-generator`

## Usage

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
  to: 1000, // default value: 1000
  nbPoints: 10001, // default value: 10001
  shape: {
    kind: 'gaussian', // default value is gaussian
  },
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

/*
Peaks can also be introduced as:
- const peaks = [{x:1,y:10},{x:2,y:30},{x:3,y:1},{x:4,y:76}]
- const peaks = {x:[1,2,3,4], y:[10,30,1,76]}
- const peaks = [ [1,10,5], [2,30,10] ] // third argument is the peak fwhm
*/

const spectrum = generateSpectrum(peaks, {
  nbPoints: 1001,
  from: 0,
  to: 10,
  shape: {
    kind: 'lorentzian',
  },
});
```

### genrateSpectrum with baseline

```js
const spectrum = generateSpectrum([{ x: 5, y: 100 }], {
  generator: {
    from: 0,
    to: 10,
    nbPoints: 51,
    peakWidthFct: () => 2,
  },
  baseline: (x) => x / 10,
});
```

### genereateSpectrum with noise

Generate with some noise

```js
const spectrum = generateSpectrum([{ x: 5, y: 100 }], {
  generator: {
    from: 0,
    to: 10,
    nbPoints: 51,
    peakWidthFct: () => 2,
  },
  noise: {
    percent: 10,
    distribution: 'uniform',
  },
});
```

## class SpectrumGenerator

```js
import { SpectrumGenerator } from 'spectrum-generator';

const generator = new SpectrumGenerator();
generator.addPeak([5, 20]);
generator.addPeak({ x: 5, y: 20 }); // we may either add an array of 2 elements or an object with x,y values
generator.addPeak([30, 56]);
generator.addPeaks([
  {x: 40, y: 12}, // it can also be an array of 2 elements
  {x: 10, y:1},
]);
const spectrum = generator.getSpectrum();

generator.reset();

generator.addPeak({x: 10, y: 50}], { // customize peaks shape
  width: 0.1, // width of peak is FWHM
  factor: 10, // 10 times fwhm. Lorentzian are rather flat
  shape: {
    kind: 'lorentzian',
  }
});

generator.addPeak({x: 10, y: 50, width: 2}) // specifiy the peak width. This is the peak width half height (FWHM)

generator.addPeak({x: 10, y: 50}], { // customize peaks shape
  width: 0.1,
  shape: {
    kind: 'gaussian',
  }
});
const otherSpectrum = generator.getSpectrum();
```

## [API Documentation](https://cheminfo.github.io/spectrum-generator/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/spectrum-generator.svg
[npm-url]: https://www.npmjs.com/package/spectrum-generator
[ci-image]: https://github.com/cheminfo/spectrum-generator/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/spectrum-generator/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/spectrum-generator.svg
[download-url]: https://www.npmjs.com/package/spectrum-generator

```

```
