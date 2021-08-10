import { SpectrumGenerator } from '..';

const numberReg = /^\w+ option must be a number$/;
const integerReg = /^\w+ option must be an integer$/;
const endStartReg = /^to option must be larger than from$/;
const peakWidthReg = /^peakWidthFct option must be a function$/;
const addPeaksReg = /^peaks must be an array/;
const addPeakError =
  'peak must be an array with two (or three) values or an object with {x,y,width?}';

describe('errors', () => {
  it('wrong options', () => {
    expect(() => new SpectrumGenerator({ from: 'abc' })).toThrow(numberReg);
    expect(() => new SpectrumGenerator({ from: false })).toThrow(numberReg);

    expect(() => new SpectrumGenerator({ to: 'abc' })).toThrow(numberReg);
    expect(() => new SpectrumGenerator({ to: false })).toThrow(numberReg);

    expect(() => new SpectrumGenerator({ nbPoints: 0.5 })).toThrow(integerReg);
    expect(() => new SpectrumGenerator({ nbPoints: false })).toThrow(
      integerReg,
    );

    expect(() => new SpectrumGenerator({ from: 0, to: 0 })).toThrow(
      endStartReg,
    );
    expect(() => new SpectrumGenerator({ from: 0, to: -10 })).toThrow(
      endStartReg,
    );

    expect(() => new SpectrumGenerator({ peakWidthFct: null })).toThrow(
      peakWidthReg,
    );
  });

  it('addPeaks not an array or an object {x:[], y:[]', () => {
    const generator = new SpectrumGenerator();
    expect(() => generator.addPeaks()).toThrow(addPeaksReg);
    expect(() => generator.addPeaks({})).toThrow(addPeaksReg);
  });

  it('addPeak not an array or an object {x,y}', () => {
    const generator = new SpectrumGenerator();
    expect(() => generator.addPeak()).toThrow(addPeakError);
    expect(() => generator.addPeak({})).toThrow(addPeakError);
    expect(() => generator.addPeak({})).toThrow(addPeakError);
    expect(() => generator.addPeak([])).toThrow(addPeakError);
    expect(() => generator.addPeak([1])).toThrow(addPeakError);
    expect(() => generator.addPeak([1, 2, 3, 4])).toThrow(addPeakError);
  });
});
