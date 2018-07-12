import addNoise from '../addNoise';

describe('Test addNoise', () => {
  var corrected = addNoise({ x: [1, 2, 3], y: [2, 3, 4] }, 10, { seed: true });
  expect(corrected.x).toHaveLength(3);
  expect(corrected).toMatchSnapshot();
});

