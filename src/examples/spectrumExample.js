// generate a spectrum with spectrum-generator
import SG from '..';

const debug = require('debug')('example');
const fs = require('fs');

const generateSpectrum = SG.generateSpectrum;

const options = { start: 0, end: 100, pointsPerUnit: 1 };
const peaks = [[4, 10], [20, 30], [23, 10], [60, 35], [90, 20]];
const spectrum = generateSpectrum(peaks, options);

debug(spectrum);

fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(spectrum), 'utf8');
