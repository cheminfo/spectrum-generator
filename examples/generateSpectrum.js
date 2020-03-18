/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/

import { generateSpectrum } from '../src';

const fs = require('fs');

const options = { from: 0, to: 100, nbPoints: 101 };
const peaks = [
  [4, 10],
  [20, 30],
  [23, 10],
  [60, 35],
  [90, 20],
];
const spectrum = generateSpectrum(peaks, options);

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(spectrum.y) }),
  'utf8',
);
