import { SpectrumGenerator } from '../SpectrumGenerator';

describe('rounding', () => {
  it('should be continuous', () => {
    const generator = new SpectrumGenerator({
      from: 359.998,
      to: 360.001,
      nbPoints: 13,
      peakWidthFct: () => 1,
    });
    generator.addPeak({ x: 359.9994514200909, y: 100 });
    const result = generator.getSpectrum();
    expect(Math.min(...result.y)).toBeGreaterThan(99);
    expect(Math.max(...result.y)).toBeLessThanOrEqual(100);
  });

  it('should be continuous 2', () => {
    const generator = new SpectrumGenerator({
      from: 359.998,
      to: 360.001,
      nbPoints: 9,
      peakWidthFct: () => 0.013,
    });
    generator.addPeak({ x: 360, y: 100 });
    const result = generator.getSpectrum();
    expect(Math.min(...result.y)).toBeGreaterThan(90);
    expect(Math.max(...result.y)).toBeLessThan(100);
  });
});
