import { generateSpectrum } from '..';

describe('generateSpectrum', () => {
  it('derivative should be continuous', () => {
    const spectrum = generateSpectrum([[0, 1, 0.12]], {
      from: -0.1,
      to: 0.1,
      nbPoints: 51,
    });

    let x = Array.from(spectrum.x);
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
      if (diff > 0 && positive === false) {
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
});
