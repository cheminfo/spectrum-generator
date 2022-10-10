import { Gaussian } from 'ml-peak-shape-generator';

import { generateSpectrum } from '../SpectrumGenerator';
import { Peak1D } from '../types/Peaks1D';

describe('generateSpectrum', () => {
  it('derivative should be continuous', () => {
    const spectrum = generateSpectrum([[0, 1, 0.12]], {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
      },
    });

    let y = Array.from(spectrum.y);
    let yPrime = [0];

    for (let i = 1; i < y.length; i++) {
      // first derivative
      yPrime[i] = y[i] - y[i - 1];
    }

    let positive = true;
    let nbChanges = 0;
    for (let i = 1; i < yPrime.length; i++) {
      let diff = yPrime[i] - yPrime[i - 1];
      if (diff > 0 && !positive) {
        positive = true;
        nbChanges++;
      }
      if (diff < 0 && positive) {
        positive = false;
        nbChanges++;
      }
    }

    expect(nbChanges).toBe(2);
  });

  it('The peak shape should be a gaussian', () => {
    let peaks: Peak1D[] = [
      {
        x: 0,
        y: 1,
        shape: { kind: 'gaussian', fwhm: 0.5 },
      },
    ];

    const spectrum = generateSpectrum(peaks, {
      generator: {
        from: -0.1,
        to: 0.1,
        nbPoints: 51,
        shape: { kind: 'lorentzian' },
      },
    });

    let index = spectrum.x.indexOf(0.06);
    const gaussian = new Gaussian({ fwhm: 0.5 });
    expect(spectrum.y[index]).toBe(gaussian.fct(0.06));
  });
});
