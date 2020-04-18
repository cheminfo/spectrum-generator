/* eslint-disable jest/expect-expect */

import { SpectrumGenerator } from '..';

describe('rounding', () => {
  it('should be continuous', () => {
    const generator = new SpectrumGenerator({
      from: 359.998,
      to: 360.001,
      nbPoints: 13,
      peakWidthFct: () => 1,
    });
    generator.addPeak({ x: 359.9994514200909, y: 100 });
    let result = generator.getSpectrum();
    expect(Math.min(...result.y)).toBeGreaterThan(99);
  });
});
