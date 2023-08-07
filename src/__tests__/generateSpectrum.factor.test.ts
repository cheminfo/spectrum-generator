import { xSum } from 'ml-spectra-processing';

import { generateSpectrum } from '../SpectrumGenerator';
import { Peak1D } from '../types/Peaks1D';

describe('generateSpectrum factor', () => {
  it('lorentzian specified', () => {
    const peaks: Peak1D[] = [
      {
        x: 0,
        y: 1,
        shape: { kind: 'lorentzian', fwhm: 0.5 },
      },
    ];

    const spectrum = generateSpectrum(peaks, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'gaussian' },
      },
      peakOptions: { factor: 0.01 },
    });
    expect(xSum(spectrum.y)).toBeCloseTo(2.9994881310384542, 6);
  });

  it('lorentzian by default', () => {
    const peaks: Peak1D[] = [
      {
        x: 0,
        y: 1,
      },
    ];

    const spectrum = generateSpectrum(peaks, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'lorentzian', fwhm: 0.5 },
      },
      peakOptions: { factor: 0.01 },
    });
    expect(xSum(spectrum.y)).toBeCloseTo(2.9994881310384542, 6);
  });

  it('gaussian by default', () => {
    const peaks: Peak1D[] = [
      {
        x: 0,
        y: 1,
      },
    ];

    const spectrum = generateSpectrum(peaks, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'gaussian', fwhm: 0.5 },
      },
      peakOptions: { factor: 0.01 },
    });
    expect(xSum(spectrum.y)).toBeCloseTo(2.99964514012866, 6);
  });
});
