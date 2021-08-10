import maxArray from 'ml-array-max';
import minArray from 'ml-array-min';

export function getMinMax(data: Float64Array[] | number[][]) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  for (let row of data) {
    let rowMin = minArray(row);
    let rowMax = maxArray(row);
    if (min > rowMin) min = rowMin;
    if (max < rowMax) max = rowMax;
  }
  return { min, max };
}
