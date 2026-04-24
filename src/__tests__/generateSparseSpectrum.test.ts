import { xyFilterX, xyMaxYPoint } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { generateSparseSpectrum } from '../generateSparseSpectrum.ts';

const generatorBase = { from: 0, to: 1000, nbPoints: 10001 };

test('single Gaussian peak — result is much smaller than dense spectrum and has expected intensity', () => {
  const sparse = generateSparseSpectrum([{ x: 500, y: 1 }], {
    generator: generatorBase,
  });
  expect(sparse.x.length).toBe(sparse.y.length);
  expect(sparse.x.length).toBe(247);

  const maxPoint = xyMaxYPoint(sparse);
  expect(maxPoint).toStrictEqual({ x: 500, y: 1, index: 123 });

  expect(Array.from(sparse.x.slice(0, 3))).toBeDeepCloseTo(
    [0, 487.8, 487.9],
    4,
  );
  expect(Array.from(sparse.x.slice(244))).toBeDeepCloseTo(
    [512.1, 512.2, 1000],
    4,
  );
  expect(Array.from(sparse.y.slice(0, 3))).toBeDeepCloseTo([0, 0, 8.875e-8], 4);
  expect(Array.from(sparse.y.slice(244))).toBeDeepCloseTo([8.875e-8, 0, 0], 4);
});

test('two non-overlapping peaks produce two separate x regions', () => {
  const sparse = generateSparseSpectrum(
    [
      { x: 100, y: 1 },
      { x: 900, y: 1 },
    ],
    { generator: generatorBase },
  );
  expect(sparse.x.length).toBe(sparse.y.length);

  // Both peaks should reach their intensity at the centre
  const leftRegion = xyFilterX(sparse, { from: 0, to: 500 });
  expect(xyMaxYPoint(leftRegion)).toStrictEqual({ x: 100, y: 1, index: 123 });
  expect(Array.from(leftRegion.x.slice(0, 3))).toBeDeepCloseTo(
    [0, 87.8, 87.9],
    4,
  );
  expect(Array.from(leftRegion.y.slice(0, 3))).toBeDeepCloseTo(
    [0, 0, 8.875e-8],
    4,
  );
  expect(Array.from(leftRegion.x.slice(-3))).toBeDeepCloseTo(
    [112, 112.1, 112.2],
    4,
  );
  expect(Array.from(leftRegion.y.slice(-3))).toBeDeepCloseTo(
    [1.16e-7, 8.875e-8, 0],
    4,
  );

  const rightRegion = xyFilterX(sparse, { from: 500, to: 1000 });
  expect(xyMaxYPoint(rightRegion)).toStrictEqual({ x: 900, y: 1, index: 122 });
  expect(Array.from(rightRegion.x.slice(0, 3))).toBeDeepCloseTo(
    [887.8, 887.9, 888],
    4,
  );
  expect(Array.from(rightRegion.y.slice(0, 3))).toBeDeepCloseTo(
    [0, 8.875e-8, 1.16e-7],
    4,
  );
  expect(Array.from(rightRegion.x.slice(-3))).toBeDeepCloseTo(
    [912.1, 912.2, 1000],
    4,
  );
  expect(Array.from(rightRegion.y.slice(-3))).toBeDeepCloseTo(
    [8.875e-8, 0, 0],
    4,
  );
});

test('two overlapping peaks are merged into one contiguous region', () => {
  const sparse = generateSparseSpectrum(
    [
      { x: 490, y: 1 },
      { x: 510, y: 1 },
    ],
    { generator: generatorBase },
  );

  const leftHalf = xyFilterX(sparse, { from: 0, to: 500 });
  expect(xyMaxYPoint(leftHalf)).toStrictEqual({ x: 490, y: 1, index: 123 });

  const rightHalf = xyFilterX(sparse, { from: 500, to: 1000 });
  expect(xyMaxYPoint(rightHalf)).toStrictEqual({ x: 510, y: 1, index: 100 });

  // 3 points at the midpoint between the two peaks
  const idx500 = Array.from(sparse.x).indexOf(500);
  expect(Array.from(sparse.x.slice(idx500 - 1, idx500 + 2))).toBeDeepCloseTo(
    [499.9, 500, 500.1],
    4,
  );
  expect(Array.from(sparse.y.slice(idx500 - 1, idx500 + 2))).toBeDeepCloseTo(
    [3.124e-5, 3.052e-5, 3.124e-5],
    4,
  );

  // beginning and end of the merged region
  expect(Array.from(sparse.x.slice(0, 3))).toBeDeepCloseTo(
    [0, 477.8, 477.9],
    4,
  );
  expect(Array.from(sparse.y.slice(0, 3))).toBeDeepCloseTo([0, 0, 8.875e-8], 4);
  expect(Array.from(sparse.x.slice(-3))).toBeDeepCloseTo(
    [522.1, 522.2, 1000],
    4,
  );
  expect(Array.from(sparse.y.slice(-3))).toBeDeepCloseTo([8.875e-8, 0, 0], 4);
});

test('PeakSeries input works correctly', () => {
  const sparse = generateSparseSpectrum(
    { x: [200, 800], y: [2, 3] },
    { generator: generatorBase },
  );
  expect(sparse.x.length).toBeGreaterThan(0);
  expect(sparse.x.length).toBe(sparse.y.length);
  expect(sparse.x.length).toBeLessThan(generatorBase.nbPoints);
  const maxPoint = xyMaxYPoint(sparse);
  expect(maxPoint.x).toBeCloseTo(800, 5);
  expect(maxPoint.y).toBeCloseTo(3, 4);
});

test('peak outside the generator range returns only boundary points', () => {
  const sparse = generateSparseSpectrum([{ x: 5000, y: 1 }], {
    generator: generatorBase,
  });
  expect(sparse.x.length).toBe(2);
  expect(sparse.x[0]).toBe(generatorBase.from);
  expect(sparse.x[1]).toBe(generatorBase.to);
  expect(sparse.y[0]).toBe(0);
  expect(sparse.y[1]).toBe(0);
});

test('threshold controls interval width — lower threshold gives more points', () => {
  const opts = { generator: generatorBase };
  const narrow = generateSparseSpectrum([{ x: 500, y: 1 }], {
    ...opts,
    threshold: 1e-2,
  });
  const wide = generateSparseSpectrum([{ x: 500, y: 1 }], {
    ...opts,
    threshold: 1e-10,
  });
  expect(wide.x.length).toBeGreaterThan(narrow.x.length);
});

test('throws if noise option is passed', () => {
  expect(() =>
    generateSparseSpectrum([{ x: 500, y: 1 }], {
      generator: generatorBase,
      // @ts-expect-error noise is not allowed for sparse spectrum
      noise: { percent: 10 },
    }),
  ).toThrow('noise is not supported for sparse spectrum generation');
});

test('baseline is added to all y values', () => {
  const sparse = generateSparseSpectrum([{ x: 500, y: 1 }], {
    generator: generatorBase,
    baseline: (x) => x * 0.001,
  });
  // boundary point at x=0: y = baseline(0) = 0
  expect(sparse.y[0]).toBeCloseTo(0, 5);
  // boundary point at x=1000: y = baseline(1000) = 1
  expect(sparse.y[sparse.y.length - 1]).toBeCloseTo(1, 5);
  // peak centre at x=500: y = peak(1) + baseline(500) = ~1.5
  const maxPoint = xyMaxYPoint(sparse);
  expect(maxPoint.x).toBeCloseTo(500, 5);
  expect(maxPoint.y).toBeGreaterThan(1.4);
});

test('asymmetric peak has correct left/right widths', () => {
  const sparse = generateSparseSpectrum(
    [{ x: 500, y: 1, shape: { kind: 'gaussian', fwhm: 5 } }],
    {
      generator: generatorBase,
      peakOptions: { widthLeft: 5, widthRight: 20 },
    },
  );
  const centre = 500;
  const leftRegion = xyFilterX(sparse, { from: 0, to: centre });
  const rightRegion = xyFilterX(sparse, { from: centre, to: 1000 });
  // first non-zero point on the left, last non-zero point on the right
  const leftEdge = leftRegion.x[leftRegion.y.findIndex((y) => y > 0)];
  const rightEdge =
    rightRegion.x[
      rightRegion.y.length -
        1 -
        [...rightRegion.y].reverse().findIndex((y) => y > 0)
    ];
  expect(rightEdge - centre).toBeGreaterThan((centre - leftEdge) * 2);
});
