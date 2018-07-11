// generate a spectrum with spectrum-generator
var generateSpectrum = require('../index.js');

const fs = require('fs');

var options = { start: 0, end: 40, pointsPerUnit: 1 };

const peaks = [[4, 10], [20, 30], [236, 1], [569, 76]];
const spectrum = generateSpectrum(peaks, options);


fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(spectrum), 'utf8');
