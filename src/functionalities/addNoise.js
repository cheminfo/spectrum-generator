// allowing noise simulation from 0 to 1
const debug = require('debug')('addNoise');

var data = { x: [1, 2, 3], y: [0, 1, 0] };


addNoise(data, 0.1);

debug(data);

/**
    * @fuction addNoise
    * @constructor
    * @param {object} [data] - Your spectrum data in the format {x:[x1, x2, ...], y:[y1, y2, ...]}
    * @param {number} [scale = 1] - The factor that determines the noise's amplitude, default is 1/100s of the spectrum max value
    */

function addNoise(data, scale = 1) {
  var factor = scale * Math.max(...data.y) / 100;
  var xs = data.x;
  var ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += Math.random() * factor;
  }
}

// finally unused function that returns average of an array values
// function arrayAverage(data) {
//  var sum = data.reduce(function (a, b) {
//    return a + b;
//  });
//  var average = sum / data.length;
//  return average;
// }

module.exports = addNoise;
