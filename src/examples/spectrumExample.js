// generate a spectrum with spectrum-generator
import SG from '..';

const debug = require('debug')('example');
const fs = require('fs');

const addBaseline = require('../functionalities/addBaseline');
const addNoise = require('../functionalities/addNoise');

var generateSpectrum = SG.generateSpectrum;

var options = { start: 0, end: 40, pointsPerUnit: 1 };

const peaks = [[4, 10], [20, 30], [236, 1], [569, 76]];
const spectrum = generateSpectrum(peaks, options);

debug(spectrum);

fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(spectrum), 'utf8');
