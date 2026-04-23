import type { NumberArray } from 'cheminfo-types';
import { Gaussian } from 'ml-peak-shape-generator';
import { xMaxValue } from 'ml-spectra-processing';
import { describe, it, expect, test } from 'vitest';

import { generateSpectrum } from '../SpectrumGenerator.ts';
import type { Peak1D } from '../types/Peaks1D.ts';

describe('generateSpectrum', () => {
  it('derivative should be continuous', () => {
    const spectrum = generateSpectrum([[0, 1, 0.12]], {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
      },
    });

    const y = Array.from(spectrum.y);
    const yPrime = [0];

    for (let i = 1; i < y.length; i++) {
      // first derivative
      yPrime[i] = y[i] - y[i - 1];
    }

    let positive = true;
    let nbChanges = 0;
    for (let i = 1; i < yPrime.length; i++) {
      const diff = yPrime[i] - yPrime[i - 1];
      if (diff > 0 && !positive) {
        positive = true;
        nbChanges++;
      }
      if (diff < 0 && positive) {
        positive = false;
        nbChanges++;
      }
    }

    expect(nbChanges).toBe(2);
  });

  it('The peak shape should be a gaussian', () => {
    const peaks: Peak1D[] = [
      {
        x: 0,
        y: 1,
        shape: { kind: 'gaussian', fwhm: 0.5 },
      },
    ];

    const spectrum = generateSpectrum(peaks, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'lorentzian' },
      },
    });

    const index = spectrum.x.indexOf(0.06);
    const gaussian = new Gaussian({ fwhm: 0.5 });
    expect(spectrum.y[index]).toBe(gaussian.fct(0.06));
  });

  it('Those two peak shape should be a pure lorentzian', () => {
    const lorentzianPeak: Peak1D[] = [
      {
        x: 0,
        y: 1,
        shape: { kind: 'lorentzian', fwhm: 0.5 },
      },
    ];

    const spectrum = generateSpectrum(lorentzianPeak, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'gaussian' },
      },
    });

    const generalizedLorentzianPeak: Peak1D[] = [
      {
        x: 0,
        y: 1,
        shape: { kind: 'generalizedLorentzian', fwhm: 0.5, gamma: 0 },
      },
    ];
    const spectrum2 = generateSpectrum(generalizedLorentzianPeak, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'gaussian' },
      },
    });

    expect(spectrum.y).toStrictEqual(spectrum2.y);
  });
});

test('test the FWHM', () => {
  const expectedFWHM = 0.11;
  const peak: Peak1D[] = [
    {
      x: 0,
      y: 1,
      shape: { kind: 'gaussian', fwhm: expectedFWHM },
    },
  ];

  const spectrum = generateSpectrum(peak, {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 510,
    },
  });
  const currentFWHM = computeFWHM(spectrum.x, spectrum.y);
  expect(currentFWHM).toBeCloseTo(expectedFWHM, 2);
});

test('test the FWHM lorentzian', () => {
  const expectedFWHM = 0.11;
  const peak: Peak1D[] = [
    {
      x: 0,
      y: 1,
      shape: { kind: 'lorentzian', fwhm: expectedFWHM },
    },
  ];

  const spectrum = generateSpectrum(peak, {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 510,
    },
  });
  const currentFWHM = computeFWHM(spectrum.x, spectrum.y);
  expect(currentFWHM).toBeCloseTo(expectedFWHM, 2);
});

test('test the FWHM pseudovoigt', () => {
  const expectedFWHM = 0.11;
  const peak: Peak1D[] = [
    {
      x: 0,
      y: 1,
      shape: { kind: 'pseudoVoigt', fwhm: expectedFWHM, mu: 0.5 },
    },
  ];

  const spectrum = generateSpectrum(peak, {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 510,
    },
  });
  const currentFWHM = computeFWHM(spectrum.x, spectrum.y);
  expect(currentFWHM).toBeCloseTo(expectedFWHM, 2);
});

test('test the FWHM generalizedLorentzian', () => {
  const expectedFWHM = 0.11;
  const peak: Peak1D[] = [
    {
      x: 0,
      y: 1,
      shape: { kind: 'generalizedLorentzian', fwhm: expectedFWHM, gamma: 0.5 },
    },
  ];

  const spectrum = generateSpectrum(peak, {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 510,
    },
  });
  const currentFWHM = computeFWHM(spectrum.x, spectrum.y);
  expect(currentFWHM).toBeCloseTo(expectedFWHM, 2);
});

function computeFWHM(x: NumberArray, y: NumberArray) {
  const xs = Array.from(x);
  const ys = Array.from(y);
  const yMax = xMaxValue(ys);
  const half = yMax / 2;

  let leftIndex = -1;
  for (let i = 0; i < ys.length; i++) {
    if (ys[i] >= half) {
      leftIndex = i;
      break;
    }
  }

  if (leftIndex === -1) return NaN;
  let leftX;
  if (leftIndex === 0) {
    leftX = xs[0];
  } else {
    const x1 = xs[leftIndex - 1];
    const y1 = ys[leftIndex - 1];
    const x2 = xs[leftIndex];
    const y2 = ys[leftIndex];
    const t = (half - y1) / (y2 - y1);
    leftX = x1 + t * (x2 - x1);
  }

  let rightIndex = -1;
  for (let i = ys.length - 1; i >= 0; i--) {
    if (ys[i] >= half) {
      rightIndex = i;
      break;
    }
  }
  if (rightIndex === -1) return NaN;
  let rightX;
  if (rightIndex === ys.length - 1) {
    rightX = xs[xs.length - 1];
  } else {
    const x1 = xs[rightIndex];
    const y1 = ys[rightIndex];
    const x2 = xs[rightIndex + 1];
    const y2 = ys[rightIndex + 1];
    const t = (half - y1) / (y2 - y1);
    rightX = x1 + t * (x2 - x1);
  }

  return rightX - leftX;
}
