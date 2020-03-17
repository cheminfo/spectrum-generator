/* eslint-disable jest/expect-expect */
import { XY } from 'ml-spectra-processing';

import { generateSpectrum } from '..';

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
  it('should work with shape 9/3, peak width 0.2', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      from: 9,
      to: 11,
      nbPoints: 21,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'gaussian',
        options: {
          length: 9,
          fwhm: 3,
        },
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[9]).toBeCloseTo(0.0625, 3);
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work with shape 17/4, peak width 0.2', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      from: 9,
      to: 11,
      nbPoints: 21,
      peakWidthFct: () => 0.4,
      shape: {
        kind: 'gaussian',
        options: {
          length: 17,
          fwhm: 4,
        },
      },
    });
    expect(spectrum.y[8]).toBe(0.5);

    checkSymmetry(spectrum);
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work from 11', () => {
    const spectrum = generateSpectrum([[10, 1]], {
      from: 9,
      to: 11,
      nbPoints: 21,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'gaussian',
        options: {
          length: 10,
          fwhm: 3,
        },
      },
    });
    let max = XY.maxYPoint(spectrum);
    expect(spectrum.y[9]).toBeCloseTo(0.15749, 4);
    expect(max.x).toBe(10);
    expect(max.y).toBe(1);
  });

  it('should work from 0 to 10 low res', () => {
    const spectrum = generateSpectrum([[5, 1]], {
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 0.2,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 4,
          length: 13,
        },
      },
    });
    let max = XY.maxYPoint(spectrum);
    expect(spectrum.y[49]).toBe(0.5);
    expect(max.x).toBe(5);
    expect(max.y).toBe(1);
  });

  it('should work from 10 to 20 low res', () => {
    const spectrum = generateSpectrum([[15, 1]], {
      from: 10,
      to: 20,
      nbPoints: 101,
      peakWidthFct: () => 2,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 500,
          length: 1501,
        },
      },
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[40]).toBe(0.5);
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(15);
    expect(max.y).toBe(1);
  });

  it('not integer from / to', () => {
    const spectrum = generateSpectrum([[2, 1]], {
      from: 1.5,
      to: 2.5,
      nbPoints: 11,
      peakWidthFct: () => 0.1,
    });
    checkSymmetry(spectrum);
    expect(spectrum.y[5]).toBe(1);
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(2);
    expect(max.y).toBe(1);
  });

  it('not integer from / to not integer', () => {
    const spectrum = generateSpectrum([[2.5, 1]], {
      from: 1.7,
      to: 3.7,
      nbPoints: 11,
      peakWidthFct: () => 0.1,
    });
    expect(spectrum.y[3]).toBe(spectrum.y[5]);

    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(2.5);
    expect(max.y).toBe(1);
  });
});

function assertSimple({ from, to, peak }) {
  const spectrum = generateSpectrum([[peak, 1]], {
    from,
    to,
    nbPoints: 11,
    peakWidthFct: simplepeakWidthFct,
  });
  assertSize(spectrum, to - from + 1);
  assertInterval(spectrum, from);
}

function assertSize(spectrum, size) {
  expect(spectrum.x).toHaveLength(size);
  expect(spectrum.y).toHaveLength(size);
}

function assertInterval(spectrum, from) {
  let expected = from;
  for (const value of spectrum.x) {
    expect(value).toBe(expected);
    expected++;
  }
}

function checkSymmetry(spectrum) {
  for (let i = 0; i <= Math.floor(spectrum.y.length / 2); i++) {
    expect(spectrum.y[i]).toStrictEqual(spectrum.y[spectrum.y.length - i - 1]);
  }
}
