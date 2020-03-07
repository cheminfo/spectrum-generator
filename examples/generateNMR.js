/*
This example with generate and save a spectrum as 'nmr.jdx'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/

import { generateSpectrum } from '../src';
import { fromJSON } from 'convert-to-jcamp';

const fs = require('fs');

let peaks = [];
for (let i = 1; i < 10; i++) {
  peaks.push([i, i * 10]);
}

const spectrum = generateSpectrum(peaks, {
  pointsPerUnit: 10000,
  start: 0,
  end: 10,
  peakWidthFct: () => 0.001, // at 500 MHz, 0.001 ppm = 0.5Hz of peak width
  shape: {
    kind: 'gaussian',
    options: {
      fwhm: 1000,
      length: 5001,
    },
  },
});

let jcamp = fromJSON(spectrum);

fs.writeFileSync(`${__dirname}/nmr.jdx`, jcamp, 'utf8');
