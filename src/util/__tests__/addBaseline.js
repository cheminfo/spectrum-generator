import addBaseline from '../addBaseline';

test('addBaseline', () => {
  let corrected = addBaseline({ x: [1, 2, 3], y: [2, 3, 4] }, (x) => 2 * x);
  expect(corrected).toMatchSnapshot();
});
