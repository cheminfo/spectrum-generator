// allowing noise simulation from 0 to 1
const debug = require('debug')('addNoise');

var data = { x: [1, 2, 3], y: [0, 1, 0] };


addNoise(data, 0.1);

debug(data);

/**
  * Add noise to the spectrum
  * @param {object} [data] - Your spectrum data in the format {x:[x1, x2, ...], y:[y1, y2, ...]}
  * @param {number} [scale = 0] - Noise's amplitude in percents of the spectrum max value
  */
export default function addNoise(data, scale = 0) {
  var factor = scale * Math.max(...data.y) / 100;
  var xs = data.x;
  var ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += Math.random() * factor;
  }
}s;

