import addNoise from '../addNoise';

test('Test addNoise', () => {
  let corrected = addNoise({ x: [1, 2, 3], y: [2, 3, 4] }, 10, { seed: 0 });
  expect(corrected.x).toHaveLength(3);
  expect(corrected).toMatchSnapshot();
});
