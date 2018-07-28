/*
This example with generate and save a spectrum as a 'data.json'
using directly the method generateSpectrum

Because it use ES6 module you need to execute this code
with transpilation on the fly using
node -r esm generateSpectrum.js
*/


import { generateSpectrum } from '../src';

const fs = require('fs');

const options = { start: 0, end: 100, pointsPerUnit: 1 };
const peaks = [[4, 10], [20, 30], [23, 10], [60, 35], [90, 20]];
const spectrum = generateSpectrum(peaks, options);

fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(spectrum), 'utf8');
