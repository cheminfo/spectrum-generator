import addBaseline from '../addBaseline';


test('Test addBaseline', () => {
  var corrected = addBaseline({ x: [1, 2, 3], y: [2, 3, 4] }, (x) => 2 * x);
  expect(corrected).toMatchSnapshot();
});

