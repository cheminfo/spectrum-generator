export default function addBaseline(data, baselineFct) {
  if (!baselineFct) return data;
  let xs = data.x;
  let ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baselineFct(xs[i]);
  }
  return data;
}
