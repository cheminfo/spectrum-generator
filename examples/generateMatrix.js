/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateMatrix.js
*/

import { generateSpectrum } from '../src';

const fs = require('fs');

const numberSpectra = 100;

const options = {
  from: -1,
  to: numberSpectra,
  nbPoints: (numberSpectra + 1) * 100 + 1,
  peakWidthFct: () => 0.3,
};
const matrix = [];
let peaks = [];

const tests = [
  [1, 1, 1],
  [1, 2, 1],
  [2, 1, 1],
];

for (let i = 1; i < numberSpectra; i++) {
  peaks.push([i, 1]);
  const spectrum = generateSpectrum(peaks, options);
  matrix.push(Array.from(spectrum.x));
  if (i === numberSpectra - 1) {
    // for debug
    fs.writeFileSync(
      `${__dirname}/data.json`,
      JSON.stringify(spectrum),
      'utf8',
    );
  }
}

fs.writeFileSync(`${__dirname}/matrix.json`, JSON.stringify(matrix), 'utf8');

let testsMatrix = [];

for (let test of tests) {
  peaks = test.map((item, i) => [i, item]);
  const spectrum = generateSpectrum(peaks, options);
  testsMatrix.push(Array.from(spectrum.x));
}

fs.writeFileSync(
  `${__dirname}/testMatrix.json`,
  JSON.stringify(matrix),
  'utf8',
);
