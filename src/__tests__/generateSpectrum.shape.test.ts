import type { NumberArray } from 'cheminfo-types';
import { Gaussian } from 'ml-peak-shape-generator';
import { xMaxValue } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { generateSpectrum } from '../generateSpectrum.ts';
import type { Peak1D } from '../types/Peaks1D.ts';

test('derivative should be continuous', () => {
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

test('The peak shape should be a gaussian', () => {
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

test('Those two peak shape should be a pure lorentzian', () => {
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

test('splitGaussian keeps its own halves', () => {
  const spectrum = generateSpectrum([{ x: 0, y: 1 }], {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 2001,
      shape: { kind: 'splitGaussian', fwhmLow: 0.05, fwhmHigh: 0.15 },
    },
  });

  expect(halfMaxCrossings(spectrum)).toStrictEqual([-0.024, 0.075]);
});

test('splitGaussian is scaled to an imposed width', () => {
  const spectrum = generateSpectrum([{ x: 0, y: 1 }], {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 2001,
      shape: { kind: 'splitGaussian', fwhmLow: 0.05, fwhmHigh: 0.15 },
      peakWidthFct: () => 0.2,
    },
  });

  // both halves scaled by 2, so the 1:3 ratio holds and the total is 0.2
  expect(halfMaxCrossings(spectrum)).toStrictEqual([-0.05, 0.149]);
});

test('widthLeft and widthRight combine with the halves of a splitGaussian', () => {
  const spectrum = generateSpectrum([{ x: 0, y: 1 }], {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 2001,
      shape: { kind: 'splitGaussian', fwhmLow: 0.05, fwhmHigh: 0.15 },
    },
    peakOptions: { widthLeft: 0.1, widthRight: 0.3 },
  });

  // widthRight scales the shape to fwhm 0.3, and its high half is 3/2 of that
  // fwhm, so the right side reaches half height at 0.225 rather than 0.15
  expect(halfMaxCrossings(spectrum)).toStrictEqual([-0.024, 0.224]);
});

/**
 * Finds the first and last x where the spectrum reaches half of its maximum.
 */
function halfMaxCrossings(spectrum: { x: NumberArray; y: NumberArray }) {
  const half = xMaxValue(spectrum.y) / 2;
  let left = 0;
  let right = 0;
  for (let index = 0; index < spectrum.y.length; index++) {
    if (spectrum.y[index] >= half) {
      left = spectrum.x[index];
      break;
    }
  }
  for (let index = spectrum.y.length - 1; index >= 0; index--) {
    if (spectrum.y[index] >= half) {
      right = spectrum.x[index];
      break;
    }
  }
  return [Number(left.toFixed(6)), Number(right.toFixed(6))];
}

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
