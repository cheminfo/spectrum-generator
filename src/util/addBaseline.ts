import type { DataXY } from 'cheminfo-types';

type BaseLineFn = (x: number) => number;

export default function addBaseline(data: DataXY, baselineFct: BaseLineFn) {
  if (!baselineFct) return data;
  let xs = data.x;
  let ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baselineFct(xs[i]);
  }
  return data;
}
