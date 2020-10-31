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
sg.addPeak([25, 100]);
sg.addPeak([50, 100], {
  width: 5,
  shape: { kind: 'lorentzian', options: { factor: 20 } },
});
sg.addPeak([75, 100], {
  width: 5,
  shape: { kind: 'lorentzian', options: { fwhm: 1000, length: 5001 } },
});

const spectrum = sg.getSpectrum();

fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify({ x: Array.from(spectrum.x), y: Array.from(spectrum.y) }),
  'utf8',
);
