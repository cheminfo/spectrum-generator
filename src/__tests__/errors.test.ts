import { SpectrumGenerator } from '../SpectrumGenerator';

const endStartReg = /^to option must be larger than from$/;
const addPeakError =
  'The fourth element of a peak array should be an object of options';

describe('errors', () => {
  it('wrong options', () => {
    expect(() => new SpectrumGenerator({ from: 0, to: 0 })).toThrow(
      endStartReg,
    );
    expect(() => new SpectrumGenerator({ from: 0, to: -10 })).toThrow(
      endStartReg,
    );
  });

  it('addPeak not an array or an object {x,y}', () => {
    const generator = new SpectrumGenerator();
    expect(() => generator.addPeak([1, 2, 3, 4])).toThrow(addPeakError);
  });
});
