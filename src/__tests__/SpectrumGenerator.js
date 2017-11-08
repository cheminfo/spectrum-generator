import {SpectrumGenerator} from '..';

describe('SpectrumGenerator', () => {
    it('full generation', () => {
        const generator = new SpectrumGenerator();

        generator.addPeak([0, 1]);
        generator.addPeak([50, 12]);
        generator.addPeaks([[100, 10], [14, 2]]);

        const spectrum = generator.getSpectrum();

        // expectValue(spectrum, 0, 1);
        expectValue(spectrum, 50 * 5, 12);
        expectValue(spectrum, 100 * 5, 10);
        expectValue(spectrum, 14 * 5, 2);

    });

    it('getSpectrum', () => {
        const generator = new SpectrumGenerator();

        const s1 = generator.getSpectrum();
        const s2 = generator.getSpectrum();

        expect(s1).not.toBe(s2);

        const s3 = generator.getSpectrum(false);
        const s4 = generator.getSpectrum(false);

        expect(s3).toBe(s4);
        expect(s3).not.toBe(s2);
    });
});

function expectValue(spectrum, index, value) {
    expect(spectrum.y[index]).toBe(value);
}
