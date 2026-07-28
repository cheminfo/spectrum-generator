import { getShape1D } from 'ml-peak-shape-generator';
import { xSum } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { generateSpectrum } from '../generateSpectrum.ts';
import type { Peak1D } from '../types/Peaks1D.ts';

const generator = {
  from: -5,
  to: 5,
  nbPoints: 1001,
  shape: { kind: 'gaussian', fwhm: 1 },
} as const;

test('area covers the requested fraction of the surface', () => {
  const shape = { kind: 'lorentzian', fwhm: 1 } as const;
  const from = -100;
  const to = 100;
  const nbPoints = 200001;

  const spectrum = generateSpectrum([{ x: 0, y: 1 }], {
    generator: { from, to, nbPoints, shape },
    peakOptions: { area: 0.995 },
  });

  const interval = (to - from) / (nbPoints - 1);
  const totalArea = getShape1D(shape).getArea(1);
  expect((xSum(spectrum.y) * interval) / totalArea).toBeCloseTo(0.995, 4);
});

test('area is equivalent to the matching factor', () => {
  const peaks: Peak1D[] = [{ x: 0, y: 1 }];

  const withArea = generateSpectrum(peaks, {
    generator,
    peakOptions: { area: 0.995 },
  });
  const withFactor = generateSpectrum(peaks, {
    generator,
    peakOptions: { factor: getShape1D(generator.shape).getFactor(0.995) },
  });

  expect(withArea.y).toStrictEqual(withFactor.y);
});

test('a smaller area truncates the peak earlier', () => {
  const peaks: Peak1D[] = [{ x: 0, y: 1 }];

  const narrow = generateSpectrum(peaks, {
    generator,
    peakOptions: { area: 0.995 },
  });
  const wide = generateSpectrum(peaks, { generator });

  expect(nonZeroRange(narrow)).toStrictEqual([-1.2, 1.2]);
  expect(nonZeroRange(wide)).toStrictEqual([-1.65, 1.65]);
});

function nonZeroRange(spectrum: { x: Float64Array; y: Float64Array }) {
  let first = -1;
  let last = -1;
  for (let index = 0; index < spectrum.y.length; index++) {
    if (spectrum.y[index] !== 0) {
      if (first === -1) first = index;
      last = index;
    }
  }
  return [
    Number(spectrum.x[first].toFixed(6)),
    Number(spectrum.x[last].toFixed(6)),
  ];
}

test('lorentzian specified', () => {
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

test('lorentzian by default', () => {
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

test('gaussian by default', () => {
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
