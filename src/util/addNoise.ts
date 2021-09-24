import type { DataXY } from 'cheminfo-types';
import { randomUniform, randomNormal } from 'd3-random';
import XSAdd from 'ml-xsadd';


type Distributions = 'uniform' | 'normal';

export interface AddNoiseOptions {
  /**
   * Type of random distribution.
   * 'uniform' (true random) or 'normal' (gaussian distribution)
   */
  distribution?: Distributions;
  /**
   * Seed for a deterministic sequence of random numbers.
   */
  seed?: number;
}

export default function addNoise(
  data: DataXY,
  percent = 0,
  options: AddNoiseOptions = {},
) {
  const { seed } = options;
  const distribution = options.distribution || ('uniform' as Distributions);
  let generateRandomNumber;

  switch (distribution) {
    case 'uniform': {
      generateRandomNumber = getRandom(randomUniform, seed, -0.5, 0.5);
      break;
    }
    case 'normal': {
      generateRandomNumber = getRandom(randomNormal, seed);
      break;
    }
    default: {
      const unHandled: never = distribution;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw Error(`Unknown distribution ${unHandled}`);
    }
  }

  if (!percent) return data;
  let ys = data.y;
  let factor = (percent * findMax(ys)) / 100;
  for (let i = 0; i < ys.length; i++) {
    ys[i] += generateRandomNumber() * factor;
  }
  return data;
}

function getRandom(
  func: typeof randomNormal | typeof randomUniform,
  seed?: number,
  ...args: [number, number | undefined] | []
) {
  return typeof seed === 'number'
    ? func.source(new XSAdd(seed).random)(...args)
    : func(...args);
}

function findMax(array: Float64Array | number[]) {
  let max = Number.MIN_VALUE;
  for (let item of array) {
    if (item > max) max = item;
  }
  return max;
}
