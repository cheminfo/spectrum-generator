/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/

import { generateSpectrum } from '../src';

const fs = require('fs');

const options = {
  from: 0,
  to: 100,
  nbPoints: 101,
  factor: 1,
  shape: {
    kind: 'lorentzian',
  },
};
const peaks = [{ x: 50, y: 100, width: 10 }];
const spectrum = generateSpectrum(peaks, options);

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(spectrum.y) }),
  'utf8',
);
