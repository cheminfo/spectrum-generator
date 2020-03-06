/* eslint-disable jest/expect-expect */
import { generateSpectrum } from '..';
import { XY } from 'ml-spectra-processing';

const simplepeakWidthFct = () => 1;

describe('generateSpectrum', () => {
  it('should work from zero', () => {
    assertSimple({
      start: 0,
      end: 10,
      peak: 5,
    });
  });

  it('should work from positive start', () => {
    assertSimple({
      start: 5,
      end: 15,
      peak: 10,
    });
  });

  it('should work from negative start', () => {
    assertSimple({
      start: -15,
      end: -5,
      peak: -10,
    });
  });
});

describe.only('generateSpectrum with one peak and small window', () => {
  it('should work from 11', () => {
    const spectrum = generateSpectrum([[12, 1]], {
      start: 11,
      end: 13,
      pointsPerUnit: 10,
      peakWidthFct: () => 0.1,
    });
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(12);
    expect(max.y).toBe(1);
  });

  it('should work from 0 to 10 low res', () => {
    const spectrum = generateSpectrum([[5, 1]], {
      start: 0,
      end: 10,
      pointsPerUnit: 1,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 3,
        },
      },
    });
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(5);
    expect(max.y).toBe(1);
  });

  it.only('should work from 10 to 20 low res', () => {
    const spectrum = generateSpectrum([[15, 1]], {
      start: 10,
      end: 20,
      pointsPerUnit: 1,
      peakWidthFct: () => 2,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 3,
        },
      },
    });
    // check if peak is symmeric
    for (let i = 0; i <= Math.floor(spectrum.y.length / 2); i++) {
      expect(spectrum.y[i]).toStrictEqual(
        spectrum.y[spectrum.y.length - i - 1],
      );
    }
    let max = XY.maxYPoint(spectrum);
    expect(max.x).toBe(15);
    expect(max.y).toBe(1);
  });
});

describe('generateSpectrum check large size', () => {
  let data = [];
  for (let i = 0; i < 10000; i++) {
    data.push([i, Math.random()]);
  }
  it('should throw error for huge array', () => {
    expect(() =>
      generateSpectrum(data, {
        start: 0,
        end: 10000,
        pointsPerUnit: 1000,
        peakWidthFct: () => 0.1,
      }),
    ).toThrow(
      'Generated array has size 10000001 larger than maxSize: 10000000',
    );
  });

  it('should throw for simple array is maxSize=1', () => {
    expect(() =>
      generateSpectrum([[1, 1]], {
        start: 0,
        end: 2,
        pointsPerUnit: 1,
        maxSize: 1,
        peakWidthFct: () => 0.1,
      }),
    ).toThrow('Generated array has size 3 larger than maxSize: 1');
  });
});

function assertSimple({ start, end, peak }) {
  const spectrum = generateSpectrum([[peak, 1]], {
    start,
    end,
    pointsPerUnit: 1,
    peakWidthFct: simplepeakWidthFct,
  });
  assertSize(spectrum, end - start + 1);
  assertInterval(spectrum, start);
}

function assertSize(spectrum, size) {
  expect(spectrum.x).toHaveLength(size);
  expect(spectrum.y).toHaveLength(size);
}

function assertInterval(spectrum, start) {
  let expected = start;
  for (const value of spectrum.x) {
    expect(value).toBe(expected);
    expected++;
  }
}
