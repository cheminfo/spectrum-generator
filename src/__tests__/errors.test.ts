import { expect, test } from 'vitest';

import { SpectrumGenerator } from '../SpectrumGenerator.ts';

const endStartReg = /^to option must be larger than from$/;

test('wrong options', () => {
  expect(() => new SpectrumGenerator({ from: 0, to: 0 })).toThrow(endStartReg);
  expect(() => new SpectrumGenerator({ from: 0, to: -10 })).toThrow(
    endStartReg,
  );
});
