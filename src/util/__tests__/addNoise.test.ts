import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { expect, test } from 'vitest';

import addNoise from '../addNoise.ts';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });
test('percent = 0', () => {
  const corrected = addNoise(
    { x: [1, 2, 3], y: [10, 20, 100] },
    {
      distribution: 'uniform',
      seed: 0,
      percent: 0,
    },
  );
  expect(corrected.x).toHaveLength(3);
  expect(Array.from(corrected.y)).toBeDeepCloseTo([10, 20, 100]);
});

test('uniform', () => {
  const corrected = addNoise(
    { x: [1, 2, 3], y: [10, 20, 100] },
    {
      distribution: 'uniform',
      seed: 0,
      percent: 10,
    },
  );
  expect(corrected.x).toHaveLength(3);
  expect(Array.from(corrected.y)).toBeDeepCloseTo([
    6.471811532974243, 17.854050993919373, 101.30019247531891,
  ]);
});
