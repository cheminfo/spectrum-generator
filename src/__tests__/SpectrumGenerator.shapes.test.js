import { Lorentzian } from 'ml-peak-shape-generator';
import { xyMaxYPoint } from 'ml-spectra-processing';

import { SpectrumGenerator } from '..';

describe('SpectrumGenerator various shapes', () => {
  it('full generation with {x:[],y:[]}', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 1,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 1000,
          length: 5001,
        },
      },
    });

    generator.addPeak({ x: 3, y: 10 });

    generator.addPeak(
      { x: 7, y: 10 },
      {
        shape: {
          kind: 'lorentzian',
          options: {
            fwhm: 1000,
            length: 5001,
          },
        },
      },
    );

    const spectrum = generator.getSpectrum();

    const ys = spectrum.y;
    expect(ys[30]).toBeCloseTo(10 + 10 * Lorentzian.fct(3 - 7, 1), 7);
    expect(ys[70]).toBeCloseTo(10, 7);

    expect(ys[31] !== ys[71]).toBe(true);
  });

  it('second test', () => {
    let spectrumGenerator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'lorentzian',
        options: {
          length: 13,
          fwhm: 4,
        },
      },
    });
    spectrumGenerator.addPeak(
      { x: 2.5, y: 2 },
      {
        width: 0.1,
        shape: {
          kind: 'lorentzian',
          options: {
            length: 13,
            fwhm: 4,
          },
        },
      },
    );
    spectrumGenerator.addPeak(
      { x: 5, y: 1 },
      {
        width: 0.2,
        shape: {
          kind: 'gaussian',
          options: {
            length: 13,
            fwhm: 4,
          },
        },
      },
    );
    const spectrum = spectrumGenerator.getSpectrum();
    let max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBeCloseTo(0.5, 2);
    expect(max.x).toBe(2.5);
    expect(max.y).toBeCloseTo(2, 3);
  });

  it('generation with [{x,y,width}]', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 5,
    });

    generator.addPeak({ x: 3, y: 10, width: 1 });

    generator.addPeak([7, 10, 1]);

    const spectrum = generator.getSpectrum();

    const ys = spectrum.y;

    expect(ys[25]).toBe(5);
    expect(ys[30]).toBe(10);
    expect(ys[35]).toBe(5);
    expect(ys[65]).toBe(5);
    expect(ys[70]).toBe(10);
    expect(ys[75]).toBe(5);

    expect(ys[31] - ys[71]).toBeCloseTo(0, 10);
  });

  it('test various width', () => {
    let spectrumGenerator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'lorentzian',
        options: {
          length: 13,
          fwhm: 4,
        },
      },
    });
    spectrumGenerator.addPeak(
      { x: 2.5, y: 2 },
      {
        width: 0.1,
        shape: {
          kind: 'lorentzian',
        },
      },
    );
    spectrumGenerator.addPeak(
      { x: 5, y: 1 },
      {
        width: 0.2,
        shape: {
          kind: 'gaussian',
        },
      },
    );
    const spectrum = spectrumGenerator.getSpectrum();
    let max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBeCloseTo(0.5, 2);
    expect(max.x).toBe(2.5);
    expect(max.y).toBeCloseTo(2, 2);
  });
});
