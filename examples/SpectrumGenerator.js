/*
This example with generate and save a spectrum as a 'data.json'
using the a class instance

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm SpectrumGenerator.js
*/

import { SpectrumGenerator } from '../src';

const fs = require('fs');

const sg = new SpectrumGenerator({ from: 0, to: 100, nbPoints: 1001 });
sg.addPeak([5, 100]);
sg.addPeak([20, 100], { width: 5 });
sg.addPeak([35, 100], { widthLeft: 10, widthRight: 30 });
sg.addPeak([50, 10], { widthLeft: 5, widthRight: 5 });
sg.addNoise(5);
sg.addBaseline((x) => (x * x) / 1e2);
const spectrum = sg.getSpectrum();

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(spectrum.y) }),
  'utf8',
);
