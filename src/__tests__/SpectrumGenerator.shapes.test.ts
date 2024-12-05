import { Lorentzian, Gaussian } from 'ml-peak-shape-generator';
import { xyMaxYPoint } from 'ml-spectra-processing';
import { describe, it, expect } from 'vitest';

import { SpectrumGenerator } from '../SpectrumGenerator';

describe('SpectrumGenerator various shapes', () => {
  it('full generation with {x:[],y:[]}', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 1,
      shape: {
        kind: 'gaussian',
      },
    });

    generator.addPeak({ x: 3, y: 10 });

    generator.addPeak(
      { x: 7, y: 10 },
      {
        shape: {
          kind: 'lorentzian',
        },
      },
    );

    const spectrum = generator.getSpectrum();

    const ys = spectrum.y;
    const lorentzian = new Lorentzian({ fwhm: 1 });
    expect(ys[30]).toBeCloseTo(10 + 10 * lorentzian.fct(3 - 7), 7);
    expect(ys[70]).toBeCloseTo(10, 7);

    expect(ys[31] !== ys[71]).toBe(true);
  });

  it('full generation with {x,y}', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 1,
      shape: {
        kind: 'gaussian',
      },
    });

    generator.addPeak({
      x: 3,
      y: 10,
      shape: { kind: 'pseudoVoigt', mu: 1 },
    });

    generator.addPeak(
      { x: 7, y: 5 },
      {
        shape: {
          kind: 'lorentzian',
        },
      },
    );

    generator.addPeak(
      { x: 7, y: 5, shape: { kind: 'pseudoVoigt', mu: 0 } },
      {
        shape: {
          kind: 'pseudoVoigt',
        },
      },
    );

    const spectrum = generator.getSpectrum();

    const ys = spectrum.y;
    const lorentzian = new Lorentzian({ fwhm: 1 });
    expect(ys[30]).toBeCloseTo(10 + 10 * lorentzian.fct(3 - 7), 7);
    expect(ys[70]).toBeCloseTo(10, 7);

    expect(ys[31] !== ys[71]).toBe(true);
  });

  it('second test', () => {
    const spectrumGenerator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      shape: {
        kind: 'lorentzian',
        fwhm: 0.1,
      },
    });
    spectrumGenerator.addPeak(
      { x: 2.5, y: 2 },
      {
        shape: {
          kind: 'lorentzian',
          fwhm: 0.1,
        },
      },
    );
    spectrumGenerator.addPeak(
      { x: 5, y: 1 },
      {
        shape: {
          kind: 'gaussian',
          fwhm: 0.2,
        },
      },
    );
    const spectrum = spectrumGenerator.getSpectrum();
    const max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBeCloseTo(0.5, 2);
    expect(max.x).toBe(2.5);
    expect(max.y).toBeCloseTo(2, 3);
  });

  it('generation with [{x,y,width}]', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
    });

    generator.addPeak({ x: 3, y: 10, shape: { kind: 'gaussian', fwhm: 1 } });

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
    const spectrumGenerator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      shape: {
        kind: 'lorentzian',
        fwhm: 0.1,
      },
    });
    spectrumGenerator.addPeak(
      { x: 2.5, y: 2 },
      {
        shape: {
          fwhm: 0.1,
          kind: 'lorentzian',
        },
      },
    );
    spectrumGenerator.addPeak(
      { x: 5, y: 1 },
      {
        shape: {
          kind: 'gaussian',
          fwhm: 0.2,
        },
      },
    );
    const spectrum = spectrumGenerator.getSpectrum();
    const max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBeCloseTo(0.5, 2);
    expect(max.x).toBe(2.5);
    expect(max.y).toBeCloseTo(2, 2);
  });

  it('The peak shape should be gaussian', () => {
    const spectrumGenerator = new SpectrumGenerator({
      from: -0.1,
      to: 0.1,
      nbPoints: 51,
      shape: { kind: 'lorentzian' },
    });

    spectrumGenerator.addPeak({
      x: 0,
      y: 1,
      shape: { kind: 'gaussian', fwhm: 0.5 },
    });

    const spectrum = spectrumGenerator.getSpectrum();
    const index = spectrum.x.indexOf(0.06);
    const gaussian = new Gaussian({ fwhm: 0.5 });
    expect(spectrum.y[index]).toBe(gaussian.fct(0.06));
  });
});
