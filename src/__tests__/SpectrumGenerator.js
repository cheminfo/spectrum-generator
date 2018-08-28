import { SpectrumGenerator } from '..';

describe('SpectrumGenerator', () => {
  it('0 half peak', () => {
    const generator = new SpectrumGenerator({
      start: 0,
      end: 2,
      pointsPerUnit: 5
    });

    generator.addPeak([0, 1]);

    const spectrum = generator.getSpectrum();
    expectValue(spectrum, 0, 1);
  });

  it('end half peak', () => {
    const generator = new SpectrumGenerator({
      start: 0,
      end: 2,
      pointsPerUnit: 5
    });

    generator.addPeak([2, 1]);

    const spectrum = generator.getSpectrum();
    expectValue(spectrum, 2 * 5, 1);
  });

  it('1 middle peak', () => {
    const generator = new SpectrumGenerator({
      start: 0,
      end: 2,
      pointsPerUnit: 5
    });

    generator.addPeak([1, 1]);

    const spectrum = generator.getSpectrum();
    expectValue(spectrum, 1 * 5, 1);
  });

  it('check asymmetric peak', () => {
    const generator = new SpectrumGenerator({
      start: 0,
      end: 100,
      pointsPerUnit: 2
    });
    generator.addPeak([35, 100], { widthLeft: 10, widthRight: 30 });
    expect(generator.getSpectrum()).toMatchSnapshot();
  });

  it('1 middle peak check width', () => {
    const generator = new SpectrumGenerator({
      start: 0,
      end: 2,
      pointsPerUnit: 10,
      peakWidthFct: (x) => 1 + (3 * x) / 1000
    });

    generator.addPeak([1, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.y[0.5 * 10]).toBeCloseTo(0.5, 2);
    expect(spectrum.y[1.5 * 10]).toBeCloseTo(0.5, 2);
    expectValue(spectrum, 1 * 10, 1);
  });

  it('full generation', () => {
    const generator = new SpectrumGenerator();

    generator.addPeak([0, 1]);
    generator.addPeak([50, 12]);
    generator.addPeaks([[100, 10], [14, 2]]);

    const spectrum = generator.getSpectrum();

    expectValue(spectrum, 0, 1);
    expectValue(spectrum, 50 * 5, 12);
    expectValue(spectrum, 100 * 5, 10);
    expectValue(spectrum, 14 * 5, 2);
  });

  it('getSpectrum', () => {
    const generator = new SpectrumGenerator();

    const s1 = generator.getSpectrum();
    const s2 = generator.getSpectrum();

    expect(s1).not.toBe(s2);

    const s3 = generator.getSpectrum(false);
    const s4 = generator.getSpectrum(false);

    expect(s3).toBe(s4);
    expect(s3).not.toBe(s2);
  });
});

function expectValue(spectrum, index, value) {
  expect(spectrum.y[index]).toBe(value);
}
