import type { DataXY } from 'cheminfo-types';
import { xyMaxYPoint } from 'ml-spectra-processing';
import { describe, it, expect } from 'vitest';

import { generateSpectrum } from '../SpectrumGenerator';

const simplepeakWidthFct = () => 1;

describe('generateSpectrum', () => {
  it('should work from zero', () => {
    assertSimple({
      from: 0,
      to: 10,
      peak: 5,
    });
  });

  it('should work from positive from', () => {
    assertSimple({
      from: 5,
      to: 15,
      peak: 10,
    });
  });

  it('should work from negative from', () => {
    assertSimple({
      from: -15,
      to: -5,
      peak: -10,
    });
  });
});

describe('generateSpectrum with one peak and small window', () => {
  it('No points', () => {
    const spectrum = generateSpectrum([{ x: 1, y: 10 }], {
      generator: {
        from: 0,
        to: 2,
        nbPoints: 0,
        peakWidthFct: () => 0.1,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    expect(spectrum).toStrictEqual({
      x: Float64Array.from([]),
      y: Float64Array.from([]),
    });
  });
  it('Very small window, only 1 point', () => {
    const spectrum = generateSpectrum([{ x: 1, y: 10 }], {
      generator: {
        from: 0,
        to: 2,
        nbPoints: 1,
        peakWidthFct: () => 0.1,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    expect(spectrum).toStrictEqual({
      x: Float64Array.from([1]),
      y: Float64Array.from([10]),
    });
  });
  it('should work with shape 9/3, peak width 0.2', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      generator: {
        from: 9,
        to: 11,
        nbPoints: 21,
        peakWidthFct: () => 0.1,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[9]).toBeCloseTo(0.0625, 3);
    const max = xyMaxYPoint(spectrum);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work with shape 17/4, peak width 0.2', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      generator: {
        from: 9,
        to: 11,
        nbPoints: 21,
        peakWidthFct: () => 0.4,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    expect(spectrum.y[8]).toBeCloseTo(0.5, 10);

    checkSymmetry(spectrum);
    const max = xyMaxYPoint(spectrum);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work from 11', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      generator: {
        from: 9,
        to: 11,
        nbPoints: 21,
        peakWidthFct: () => 0.1,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    const max = xyMaxYPoint(spectrum);
    expect(spectrum.y[9]).toBeCloseTo(0.0625, 4);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work from 0 to 10 low res', () => {
    const spectrum = generateSpectrum([[5, 1]], {
      generator: {
        from: 0,
        to: 10,
        nbPoints: 101,
        peakWidthFct: () => 0.2,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    const max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBeCloseTo(0.5, 10);
    expect(max.x).toBe(5);
    expect(max.y).toBe(1);
  });

  it('should work from 10 to 20 low res', () => {
    const spectrum = generateSpectrum([[15, 1]], {
      generator: {
        from: 10,
        to: 20,
        nbPoints: 101,
        peakWidthFct: () => 2,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[40]).toBe(0.5);
    const max = xyMaxYPoint(spectrum);
    expect(max.x).toBe(15);
    expect(max.y).toBe(1);
  });

  it('not integer from / to', () => {
    const spectrum = generateSpectrum([[2, 1]], {
      generator: {
        from: 1.5,
        to: 2.5,
        nbPoints: 11,
        peakWidthFct: () => 0.1,
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[5]).toBe(1);
    const max = xyMaxYPoint(spectrum);
    expect(max.x).toBe(2);
    expect(max.y).toBe(1);
  });

  it('not integer from / to not integer', () => {
    const spectrum = generateSpectrum([[2.5, 1]], {
      generator: {
        from: 1.7,
        to: 3.7,
        nbPoints: 11,
        peakWidthFct: () => 0.1,
      },
    });
    expect(spectrum.y[3]).toBe(spectrum.y[5]);

    const max = xyMaxYPoint(spectrum);
    expect(max.x).toBe(2.5);
    expect(max.y).toBe(1);
  });
});

function assertSimple(options: { from: number; to: number; peak: number }) {
  const { from, to, peak } = options;
  const spectrum = generateSpectrum([[peak, 1]], {
    generator: {
      from,
      to,
      nbPoints: 11,
      peakWidthFct: simplepeakWidthFct,
    },
  });
  assertSize(spectrum, to - from + 1);
  assertInterval(spectrum, from);
}

function assertSize(spectrum: DataXY, size: number) {
  expect(spectrum.x).toHaveLength(size);
  expect(spectrum.y).toHaveLength(size);
}

function assertInterval(spectrum: DataXY, from: number) {
  let expected = from;
  for (const value of spectrum.x) {
    expect(value).toBe(expected);
    expected++;
  }
}

function checkSymmetry(spectrum: DataXY) {
  for (let i = 0; i <= Math.floor(spectrum.y.length / 2); i++) {
    expect(spectrum.y[i] - spectrum.y[spectrum.y.length - i - 1]).toBeCloseTo(
      0,
    );
  }
}
