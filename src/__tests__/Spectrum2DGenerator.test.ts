import { gaussian2D } from 'ml-peak-shape-generator';

import { Spectrum2DGenerator } from '../Spectrum2DGenerator';

describe('Spectrum2DGenerator', () => {
  it('0 half peak', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([1, 1, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.z[5][5]).toBe(1);
  });

  it('to half peak', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([0, 2, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.z[2 * 5][0]).toBe(1);
  });

  it('1 middle peak', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 2,
      nbPoints: 11,
    });

    generator.addPeak([1, 0, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.z[0][1 * 5]).toBe(1);
  });

  it('check asymmetric peak', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 100,
      nbPoints: 201,
    });
    generator.addPeak([50, 50, 100], { width: { x: 15, y: 5 }, factor: 15 });
    const spectrum = generator.getSpectrum();
    const zMatrix = spectrum.z as Float64Array[];
    const sumZ = zMatrix.reduce(
      (previous, value) =>
        previous + value.reduce((previous, value) => previous + value, 0),
      0,
    );
    expect(sumZ * generator.interval.x * generator.interval.y).toBeCloseTo(
      gaussian2D.getSurface({ fwhm: { x: 15, y: 5 }, height: 100 }),
      0,
    );
  });

  it('1 middle peak check width', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 2,
      nbPoints: 21,
      peakWidthFct: (x: number) => 1 + (3 * x) / 1000,
    });

    generator.addPeak([1, 1, 1]);

    const spectrum = generator.getSpectrum();
    expect(spectrum.z[10][0.5 * 10]).toBeCloseTo(0.5, 2);
    expect(spectrum.z[10][1.5 * 10]).toBeCloseTo(0.5, 2);
    expect(spectrum.z[10][1 * 10]).toBe(1);
  });

  it('non-integer middle point', () => {
    const generator = new Spectrum2DGenerator({
      from: 0,
      to: 5,
      nbPoints: 26,
    });

    generator.addPeak([2.5, 2.5, 2]);

    // The middle point (peak's summit) is not exactly on an indexable place
    // We check that the peak is symmetric and its values never go higher than
    // the peak's height
    const spectrum = generator.getSpectrum();
    const xNbPoints = spectrum.z.length;
    const yNbPoints = spectrum.z[0].length;

    for (let i = 0; i < xNbPoints / 2; i++) {
      for (let j = 0; j < yNbPoints / 2; j++) {
        expect(spectrum.z[j][i]).toBeCloseTo(
          spectrum.z[j][xNbPoints - 1 - i],
          7,
        );
        expect(spectrum.z[j][i]).toBeLessThan(2);
      }
    }
    for (let i = 0; i < xNbPoints / 2; i++) {
      for (let j = 0; j < yNbPoints / 2; j++) {
        expect(spectrum.z[j][i]).toBeCloseTo(
          spectrum.z[yNbPoints - 1 - j][i],
          7,
        );
      }
    }
  });

  it('full generation', () => {
    const generator = new Spectrum2DGenerator();

    generator.addPeak([50, 0, 1]);
    generator.addPeak([50, 50, 12]);
    generator.addPeaks([
      [50, 10, 10],
      [50, 74, 2],
    ]);

    const spectrum = generator.getSpectrum();

    expect(spectrum.z[0][500]).toBeCloseTo(1, 3);
    expect(spectrum.z[500][50 * 10]).toBeCloseTo(12, 3);
    expect(spectrum.z[10 * 10][500]).toBeCloseTo(10, 3);
    expect(spectrum.z[74 * 10][500]).toBeCloseTo(2, 3);
  });

  it('full generation with {x,y}', () => {
    const generator = new Spectrum2DGenerator();

    generator.addPeak({ x: 0, y: 50, z: 1 });
    generator.addPeak({ x: 50, y: 50, z: 12 });
    generator.addPeaks([
      { x: 100, y: 50, z: 10 },
      { x: 14, y: 50, z: 2 },
    ]);

    const spectrum = generator.getSpectrum();

    expect(spectrum.z[500][0]).toBeCloseTo(1, 3);
    expect(spectrum.z[500][50 * 10]).toBeCloseTo(12, 3);
    expect(spectrum.z[500][100*10]).toBeCloseTo(10, 3);
    expect(spectrum.z[500][14 * 10]).toBeCloseTo(2, 3);
  });

  it('full generation with {x:[],y:[]}', () => {
    const generator = new Spectrum2DGenerator();

    generator.addPeak({ x: 0, y: 50, z: 1 });
    generator.addPeak({ x: 50, y: 50, z: 12 });
    generator.addPeaks({ x: [100, 14], y: [10, 50], z: [10, 30] });

    const spectrum = generator.getSpectrum();
    expect(spectrum.z[50 * 10][0]).toBeCloseTo(1, 3);
    expect(spectrum.z[50 * 10][50 * 10]).toBeCloseTo(12, 3);
    expect(spectrum.z[10 * 10][100 * 10]).toBeCloseTo(10, 3);
    expect(spectrum.z[50 * 10][14 * 10]).toBeCloseTo(30, 3);
  });

  it('getSpectrum', () => {
    const generator = new Spectrum2DGenerator();

    const s1 = generator.getSpectrum();
    const s2 = generator.getSpectrum();

    expect(s1.z).not.toBe(s2.z);

    const s3 = generator.getSpectrum(false);
    const s4 = generator.getSpectrum(false);

    expect(s3.z).toBe(s4.z);
    expect(s3.z).not.toBe(s2.z);

    const s5 = generator.getSpectrum({ copy: false });
    const s6 = generator.getSpectrum({ copy: false });

    expect(s5.z).toBe(s6.z);
    expect(s5.z).not.toBe(s2.z);
  });
});
