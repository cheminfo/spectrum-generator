import { expect, test } from 'vitest';

import { generateSpectrum } from '../generateSpectrum.ts';

test('derivative should be continuous', () => {
  const spectrumFWHM = generateSpectrum(
    [{ x: 0, y: 1, shape: { kind: 'gaussian', fwhm: 0.2 } }],
    {
      generator: {
        from: -1,
        to: 1,
        nbPoints: 51,
      },
    },
  );

  const spectrumWidth = generateSpectrum([{ x: 0, y: 1, width: 0.2 }], {
    generator: {
      from: -1,
      to: 1,
      nbPoints: 51,
    },
  });

  expect(Array.from(spectrumWidth.y)).not.toStrictEqual(
    Array.from(spectrumFWHM.y),
  );
});
