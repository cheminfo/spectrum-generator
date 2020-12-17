/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/

import SG from 'ml-savitzky-golay-generalized';

import { generateSpectrum } from '../src';

const fs = require('fs');

const options = { from: 0, to: 1000, nbPoints: 10001, factor: 10 };
const peaks = [
  [530, 0.03, 120],
  [140, 0.0025, 90],
];
const spectrum = generateSpectrum(peaks, options);

const { x, y } = spectrum;

const ddY = SG(y, x[1] - x[0], {
  derivative: 2,
});

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(ddY) }),
  'utf8',
);
