/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/

import { generateSpectrum } from '../src';

const fs = require('fs');

const xMax = 25;
const peakWidth = 0.1;

const options = {
  from: 0,
  to: xMax,
  nbPoints: xMax * 100 + 1,
  noise: { percent: 2 },
  peakWidthFct: () => peakWidth,
};

let peaks = [];
for (let i = 0; i < 20; i++) {
  peaks.push([Math.random() * xMax, Math.random() * 100]);
}
const spectrum = generateSpectrum(peaks, options);

let text = [];
for (let i = 0; i < spectrum.x.length; i++) {
  text.push(
    `${String(spectrum.x[i].toFixed(2)).padStart(7)} ${String(
      spectrum.y[i].toFixed(4),
    ).padStart(10)}`,
  );
}

// fs.writeFileSync(`${__dirname}/data.txt`, text.join('\n'), 'utf8');

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(spectrum.y) }),
  'utf8',
);
