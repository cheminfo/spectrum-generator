import { SpectrumGenerator } from '../SpectrumGenerator';

const endStartReg = /^to option must be larger than from$/;

describe('errors', () => {
  it('wrong options', () => {
    expect(() => new SpectrumGenerator({ from: 0, to: 0 })).toThrow(
      endStartReg,
    );
    expect(() => new SpectrumGenerator({ from: 0, to: -10 })).toThrow(
      endStartReg,
    );
  });
});
