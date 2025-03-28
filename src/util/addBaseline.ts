import type { DataXY } from 'cheminfo-types';

type BaseLineFn = (x: number) => number;

/**
 * Adds a baseline to the spectrum data.
 * @param data - The spectrum data to modify.
 * @param baselineFct - Function that generates the baseline value for a given x.
 * @returns The modified spectrum data.
 */
export default function addBaseline(data: DataXY, baselineFct: BaseLineFn) {
  if (!baselineFct) return data;
  const xs = data.x;
  const ys = data.y;
  for (let i = 0; i < xs.length; i++) {
    ys[i] += baselineFct(xs[i]);
  }
  return data;
}
