import { test, expect } from 'vitest';

import addBaseline from '../addBaseline.ts';

test('addBaseline', () => {
  const corrected = addBaseline({ x: [1, 2, 3], y: [2, 3, 4] }, (x) => 2 * x);
  expect(corrected).toMatchSnapshot();
});
