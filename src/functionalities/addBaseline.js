// trying to generate anything with spectrum-generator

const debug = require('debug')('addBaseline');

var data = { x: [1, 2, 3], y: [0, 0, 0] };

addBaseline(data, (x) => x ** 2);

debug(data);

/**
    * @fuction addBaseline
    * @constructor
    * @param {object} [data] - Your spectrum data in the format {x:[x1, x2, ...], y:[y1, y2, ...]}
    * @param {function} [baseline] - Mathematical function producing the baseline you want
    */

function addBaseline(data, baseline) {
  var xs = data.x;
  var ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baseline(xs[i]);
    debug(xs[i], baseline(xs[i]));
  }
}

module.exports = addBaseline;
