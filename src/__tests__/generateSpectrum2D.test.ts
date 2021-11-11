import maxArray from 'ml-array-max';

import type { Spectrum2D } from '../Spectrum2DGenerator';
import { generateSpectrum2D } from '../Spectrum2DGenerator';

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
  it('should work with shape 9/3, and different sizes', () => {
    const spectrum = generateSpectrum2D([[10, 10, 1]], {
      generator: {
        from: 9,
        to: 11,
        nbPoints: { x: 21, y: 41},
        peakWidthFct: () => 0.1,
        shape: {
          kind: 'gaussian',
        },
      },
    });
    expect(spectrum.z[20][10]).toBeCloseTo(1, 3);
    expect(spectrum.z[20][9]).toBeCloseTo(0.0625, 3);
    expect(spectrum.z[18][10]).toBeCloseTo(0.0625, 3);
  });
  it('should work with shape 9/3, peak width 0.2', () => {
    const spectrum = generateSpectrum2D([[10, 10, 1]], {
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
    expect(spectrum.z[10][9]).toBeCloseTo(spectrum.z[9][10], 3);
    expect(spectrum.z[9][10]).toBeCloseTo(0.0625, 3);
    checkSymmetry(spectrum);
    checkMax(spectrum, 10);
  });

  it('should work with shape 17/4, peak width 0.2', () => {
    const spectrum = generateSpectrum2D([[10, 10, 1]], {
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
    expect(spectrum.z[10][8]).toBeCloseTo(0.5, 10);

    checkSymmetry(spectrum);
    checkMax(spectrum, 10);
  });

  it('should work from 11', () => {
    const spectrum = generateSpectrum2D([[10, 10, 1]], {
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
    expect(spectrum.z[9][10]).toBeCloseTo(0.0625, 4);
    checkMax(spectrum, 10);
  });

  it('should work from 0 to 10 low res', () => {
    const spectrum = generateSpectrum2D([[5, 5, 1]], {
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
    expect(spectrum.z[50][49]).toBeCloseTo(0.5, 10);
    checkMax(spectrum, 5);
  });

  it('should work from 10 to 20 low res', () => {
    const spectrum = generateSpectrum2D([[15, 15, 1]], {
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
    expect(spectrum.z[50][40]).toBe(0.5);
    checkMax(spectrum, 15);
  });

  it('not integer from / to', () => {
    const spectrum = generateSpectrum2D([[2, 2, 1]], {
      generator: {
        from: 1.5,
        to: 2.5,
        nbPoints: 11,
        peakWidthFct: () => 0.1,
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.z[5][5]).toBe(1);
    checkMax(spectrum, 2);
  });

  it('not integer from / to not integer', () => {
    const spectrum = generateSpectrum2D([[2.5, 2.5, 1]], {
      generator: {
        from: 1.7,
        to: 3.7,
        nbPoints: 11,
        peakWidthFct: () => 0.1,
      },
    });
    expect(spectrum.z[5][3]).toBe(spectrum.z[5][5]);
    checkSymmetry(spectrum);
    checkMax(spectrum, 2.5);
  });
});

function assertSimple(options: { from: number; to: number; peak: number }) {
  const { from, to, peak } = options;
  const spectrum = generateSpectrum2D([[peak, peak, 1]], {
    generator: {
      from,
      to,
      nbPoints: 11,
      peakWidthFct: simplepeakWidthFct,
    },
  });
  assertSize(spectrum, to - from + 1);
}

function assertSize(spectrum: Spectrum2D, size: number) {
  expect(spectrum.z).toHaveLength(size);
  expect(spectrum.z[0]).toHaveLength(size);
}

function checkSymmetry(spectrum: Spectrum2D) {
  let yCenter = Math.floor(spectrum.z.length / 2);
  for (let i = 0; i <= yCenter; i++) {
    expect(
      spectrum.z[yCenter][i] - spectrum.z[yCenter][spectrum.z.length - i - 1],
    ).toBeCloseTo(0);
  }
  for (let i = 0; i <= yCenter; i++) {
    expect(
      spectrum.z[i][yCenter] - spectrum.z[spectrum.z.length - i - 1][yCenter],
    ).toBeCloseTo(0);
  }
}

function checkMax(spectrum: Spectrum2D, center: number) {
  const { maxX, minX, maxY, minY, z } = spectrum;

  const maxRows = [];
  for (let row of z) {
    maxRows.push(maxArray(row));
  }
  let max = maxArray(maxRows);
  let yIndex = maxRows.indexOf(max);
  let xIndex = z[yIndex].indexOf(maxRows[yIndex]);
  expect(minX + (xIndex * (maxX - minX)) / (maxRows.length - 1)).toBe(center);
  expect(minY + (yIndex * (maxY - minY)) / (maxRows.length - 1)).toBe(center);
  expect(max).toBe(1);
}
