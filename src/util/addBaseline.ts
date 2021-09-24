import type { Data1D } from '../../types/Data1D';

type baseLineFn = (x: number) => number;

export default function addBaseline(data: Data1D, baselineFct: baseLineFn) {
  if (!baselineFct) return data;
  let xs = data.x;
  let ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baselineFct(xs[i]);
  }
  return data;
}
