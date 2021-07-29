import { randomUniform, randomNormal } from 'd3-random';
import XSAdd from 'ml-xsadd';

import type { AddNoiseOpt } from '../types/addNoiseOpt';
import type { Data } from '../types/data';

export default function addNoise(
  data: Data,
  percent = 0,
  options: AddNoiseOpt = {},
) {
  const { distribution = 'uniform', seed } = options;

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
    default:
      throw new Error(`Unknown distribution ${distribution}`);
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
