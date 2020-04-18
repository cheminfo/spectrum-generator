/* eslint-disable jest/expect-expect */
import { SpectrumGenerator } from '..';

describe('SpectrumGenerator', () => {
  it('0 half peak', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([0, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.y[0]).toBe(1);
  });

  it('to half peak', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([2, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.y[2 * 5]).toBe(1);
  });

  it('1 middle peak', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([1, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.y[1 * 5]).toBe(1);
  });

  it('check asymmetric peak', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 100,
      nbPoints: 201,
    });
    generator.addPeak([50, 100], { widthLeft: 10, widthRight: 30 });
    const spectrum = generator.getSpectrum();

    const sumX = spectrum.x.reduce((previous, value) => previous + value);
    const sumY = spectrum.y.reduce((previous, value) => previous + value);
    expect(sumX).toBe(10050);
    expect(sumY).toBeCloseTo(4257.612704089137, 4);
  });

  it('1 middle peak check width', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 2,
      nbPoints: 21,
      peakWidthFct: (x) => 1 + (3 * x) / 1000,
    });

    generator.addPeak([1, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.y[0.5 * 10]).toBeCloseTo(0.5, 2);
    expect(spectrum.y[1.5 * 10]).toBeCloseTo(0.5, 2);
    expect(spectrum.y[1 * 10]).toBe(1);
  });

  it('non-integer middle point', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 5,
      nbPoints: 26,
    });

    generator.addPeak([2.5, 2]);

    // The middle point (peak's summit) is not exactly on an indexable place
    // We check that the peak is symmetric and its values never go higher than
    // the peak's height
    const spectrum = generator.getSpectrum();
    const nPoints = spectrum.x.length;
    for (let i = 0; i < nPoints / 2; i++) {
      expect(spectrum.y[i]).toBe(spectrum.y[nPoints - 1 - i]);
      expect(spectrum.y[i]).toBeLessThan(2);
    }
  });

  it('full generation', () => {
    const generator = new SpectrumGenerator();

    generator.addPeak([0, 1]);
    generator.addPeak([50, 12]);
    generator.addPeaks([
      [100, 10],
      [14, 2],
    ]);

    const spectrum = generator.getSpectrum();

    expect(spectrum.y[0]).toBe(1);
    expect(spectrum.y[50 * 10]).toBe(12);
    expect(spectrum.y[100 * 10]).toBe(10);
    expect(spectrum.y[14 * 10]).toBe(2);
  });

  it('full generation with {x,y}', () => {
    const generator = new SpectrumGenerator();

    generator.addPeak({ x: 0, y: 1 });
    generator.addPeak({ x: 50, y: 12 });
    generator.addPeaks([
      { x: 100, y: 10 },
      { x: 14, y: 2 },
    ]);

    const spectrum = generator.getSpectrum();

    expect(spectrum.y[0]).toBe(1);
    expect(spectrum.y[50 * 10]).toBe(12);
    expect(spectrum.y[100 * 10]).toBe(10);
    expect(spectrum.y[14 * 10]).toBe(2);
  });

  it('full generation with threshold', () => {
    const generator = new SpectrumGenerator({
      from: -1000,
      to: 1000,
      nbPoints: 20000001,
      peakWidthFct: () => 0.001,
    });

    generator.addPeak([0, 1]);
    generator.addPeak([50, 12]);
    generator.addPeaks([
      [100, 10],
      [14, 2],
    ]);

    const spectrum = generator.getSpectrum({ threshold: 0.001 });

    const sumX = spectrum.x.reduce((previous, value) => previous + value);
    const sumY = spectrum.y.reduce((previous, value) => previous + value);
    expect(sumX).toBeCloseTo(5028, 4);
    expect(sumY).toBeCloseTo(265.9928557821358, 4);
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

    const s5 = generator.getSpectrum({ copy: false });
    const s6 = generator.getSpectrum({ copy: false });

    expect(s5).toBe(s6);
    expect(s5).not.toBe(s2);
  });
});
