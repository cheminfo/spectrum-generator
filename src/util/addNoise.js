import { randomUniform, randomNormal } from 'd3-random';
import XSAdd from 'ml-xsadd';

export default function addNoise(data, percent = 0, options = {}) {
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
      throw new Error(`Unknown distribution ${options.distribution}`);
  }

  if (!percent) return data;
  let ys = data.y;
  let factor = (percent * findMax(ys)) / 100;
  for (let i = 0; i < ys.length; i++) {
    ys[i] += generateRandomNumber() * factor;
  }
  return data;
}

function getRandom(func, seed, ...args) {
  return typeof seed === 'number'
    ? func.source(new XSAdd(seed).random)(...args)
    : func(...args);
}

function findMax(array) {
  let max = Number.MIN_VALUE;
  for (let item of array) {
    if (item > max) max = item;
  }
  return max;
}
