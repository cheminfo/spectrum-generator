import { xyMaxYPoint } from 'ml-spectra-processing';
import { SpectrumGenerator } from '..';

describe('SpectrumGenerator various shapes', () => {
  it('full generation with {x:[],y:[]}', () => {
    const generator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 1,
      shape: {
        kind: 'gaussian',
        options: {
          fwhm: 1000,
          length: 5001,
        },
      },
    });

    generator.addPeak({ x: 3, y: 10 });

    generator.addPeak(
      { x: 7, y: 10 },
      {
        shape: {
          kind: 'lorentzian',
          options: {
            fwhm: 1000,
            length: 5001,
          },
        },
      },
    );

    const spectrum = generator.getSpectrum();

    const ys = spectrum.y;
    expect(ys[30]).toBe(10);
    expect(ys[70]).toBe(10);

    expect(ys[31] !== ys[71]).toBe(true);
  });

  it('second test', () => {
    let spectrumGenerator = new SpectrumGenerator({
      from: 0,
      to: 10,
      nbPoints: 101,
      peakWidthFct: () => 0.1,
      shape: {
        kind: 'lorentzian',
        options: {
          length: 13,
          fwhm: 4,
        },
      },
    });
    spectrumGenerator.addPeak(
      { x: 2.5, y: 2 },
      {
        width: 0.1,
        shape: {
          kind: 'lorentzian',
          options: {
            length: 13,
            fwhm: 4,
          },
        },
      },
    );
    spectrumGenerator.addPeak(
      { x: 5, y: 1 },
      {
        width: 0.2,
        shape: {
          kind: 'gaussian',
          options: {
            length: 13,
            fwhm: 4,
          },
        },
      },
    );
    const spectrum = spectrumGenerator.getSpectrum();
    let max = xyMaxYPoint(spectrum);
    expect(spectrum.y[49]).toBe(0.5);
    expect(max.x).toBe(2.5);
    expect(max.y).toBe(2);
  });
});
