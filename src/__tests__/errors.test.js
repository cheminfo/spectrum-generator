import { SpectrumGenerator } from '..';

const numberReg = /^\w+ option must be a number$/;
const integerReg = /^\w+ option must be an integer$/;
const endStartReg = /^end option must be larger than start$/;
const peakWidthReg = /^peakWidthFct option must be a function$/;
const addPeaksReg = /^peaks must be an array$/;
const addPeakReg = /^peak must be an array with two values$/;

describe('errors', () => {
  it('wrong options', () => {
    expect(() => new SpectrumGenerator({ start: 'abc' })).toThrow(numberReg);
    expect(() => new SpectrumGenerator({ start: false })).toThrow(numberReg);

    expect(() => new SpectrumGenerator({ end: 'abc' })).toThrow(numberReg);
    expect(() => new SpectrumGenerator({ end: false })).toThrow(numberReg);

    expect(() => new SpectrumGenerator({ pointsPerUnit: 0.5 })).toThrow(
      integerReg,
    );
    expect(() => new SpectrumGenerator({ pointsPerUnit: false })).toThrow(
      integerReg,
    );

    expect(() => new SpectrumGenerator({ start: 0, end: 0 })).toThrow(
      endStartReg,
    );
    expect(() => new SpectrumGenerator({ start: 0, end: -10 })).toThrow(
      endStartReg,
    );

    expect(() => new SpectrumGenerator({ peakWidthFct: null })).toThrow(
      peakWidthReg,
    );
  });

  it('addPeaks not an array', () => {
    const generator = new SpectrumGenerator();
    expect(() => generator.addPeaks()).toThrow(addPeaksReg);
    expect(() => generator.addPeaks({})).toThrow(addPeaksReg);
  });

  it('addPeak not an array', () => {
    const generator = new SpectrumGenerator();
    expect(() => generator.addPeak()).toThrow(addPeakReg);
    expect(() => generator.addPeak({})).toThrow(addPeakReg);
    expect(() => generator.addPeak({})).toThrow(addPeakReg);
    expect(() => generator.addPeak([])).toThrow(addPeakReg);
    expect(() => generator.addPeak([1])).toThrow(addPeakReg);
    expect(() => generator.addPeak([1, 2, 3])).toThrow(addPeakReg);
  });
});
