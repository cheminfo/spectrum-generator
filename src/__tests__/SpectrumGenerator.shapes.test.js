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
});
