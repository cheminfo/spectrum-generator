import { generateSpectrum } from '../SpectrumGenerator';

describe('generateSpectrum width / fwhm', () => {
  it('derivative should be continuous', () => {
    const spectrumFWHM = generateSpectrum([{ x: 0, y: 1, fwhm: 0.2 }], {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 51,
      },
    });

    const spectrumWidth = generateSpectrum([{ x: 0, y: 1, width: 0.2 }], {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 51,
      },
    });

    expect(Array.from(spectrumWidth.y)).toStrictEqual(
      Array.from(spectrumFWHM.y),
    );
  });
});
