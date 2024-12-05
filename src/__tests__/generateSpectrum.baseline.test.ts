import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { describe, it, expect } from 'vitest';

import { generateSpectrum } from '../SpectrumGenerator';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

describe('generateSpectrum with baseline', () => {
  it('derivative should be continuous', () => {
    const spectrum = generateSpectrum([{ x: 5, y: 100 }], {
      generator: {
        from: 0,
        to: 10,
        nbPoints: 51,
        peakWidthFct: () => 2,
      },
      baseline: (x) => x / 10,
    });
    expect(spectrum.y).toBeDeepCloseTo([
      0, 0.02, 0.04, 0.06000000000000001, 0.08, 0.10152587890625,
      0.1244991126015964, 0.1525502176105477, 0.193120222838078,
      0.26268997191040294, 0.3953125, 0.6564402883094613, 1.162650516741822,
      2.1053010334836415, 3.7715223064756893, 6.55, 10.904316404531594,
      17.29755409309591, 26.062845666401667, 37.236730432277554, 50.4,
      64.59129487814522, 78.35645796605, 89.96250709279727, 97.74549474122858,
      100.5, 97.78549474122853, 90.04250709279722, 78.47645796604996,
      64.75129487814516, 50.6, 37.47673043227752, 26.342845666401647,
      17.61755409309588, 11.264316404531572, 6.95, 4.211522306475685,
      2.5853010334836397, 1.6826505167418193, 1.2164402883094598, 0.9953125,
      0.9026899719104027, 0.873120222838078, 0.8725502176105477,
      0.8844991126015965, 0.90152587890625, 0.9200000000000002,
      0.9400000000000001, 0.9600000000000002, 0.9800000000000001, 1,
    ]);
  });
});
