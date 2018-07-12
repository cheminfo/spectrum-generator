
/**
  * Add a baseline to the spectrum
  * @param {object} [data] - Your spectrum data in the format {x:[x1, x2, ...], y:[y1, y2, ...]}
  * @param {function} [baselineFct] - Mathematical function producing the baseline you want
  * @return {object} data
  */
export default function addBaseline(data, baselineFct) {
  if (!baselineFct) return data;
  var xs = data.x;
  var ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baselineFct(xs[i]);
  }
  return data;
}
