import type { DataXY } from 'cheminfo-types';
import type { Shape1DInstance } from 'ml-peak-shape-generator';

import { BaseSpectrumGenerator } from './BaseSpectrumGenerator.ts';
import type {
  NumToNumFn,
  OptionsSG1D,
  PeakOptions,
} from './BaseSpectrumGenerator.ts';
import type { Peak1D, PeakSeries } from './types/Peaks1D.ts';

export interface SparseSpectrumOptions {
  /**
   * Function to add a baseline to the spectrum.
   */
  baseline?: NumToNumFn;
  /**
   * Options for peak shapes and widths.
   */
  peakOptions?: PeakOptions;
  /**
   * Threshold relative to the normalized shape value (1 at peak centre) used
   * to determine how far each peak's x interval extends. Points where
   * `shape.fct(x − x₀) < threshold` are excluded.
   * @default 1e-7
   */
  threshold?: number;
}

interface ResolvedSparsePeak {
  x0: number;
  intensity: number;
  shapeLeft: Shape1DInstance;
  shapeRight: Shape1DInstance;
  xFrom: number;
  xTo: number;
}

interface MergedInterval {
  xFrom: number;
  xTo: number;
  peaks: ResolvedSparsePeak[];
}

export class SparseSpectrumGenerator extends BaseSpectrumGenerator {
  public constructor(options: OptionsSG1D = {}) {
    super(options);
  }

  /**
   * Generates a sparse spectrum containing only x values where at least one
   * peak contributes above the threshold. No dense array is allocated:
   * intervals are computed per peak first, then y is evaluated only for the
   * merged set of required x values.
   * @param peaks - List of peaks to include.
   * @param options - Options for sparse spectrum generation.
   * @returns Sparse spectrum data with x and y arrays covering only peak regions.
   */
  public generateSparseSpectrum(
    peaks: Peak1D[] | PeakSeries,
    options: SparseSpectrumOptions = {},
  ): DataXY<Float64Array> {
    if ('noise' in options) {
      throw new Error('noise is not supported for sparse spectrum generation');
    }
    const { baseline, peakOptions = {}, threshold = 1e-7 } = options;

    const peakArray: Peak1D[] = Array.isArray(peaks)
      ? peaks
      : Array.from(peaks.x, (x, i) =>
          peaks.fwhm !== undefined
            ? ([x, peaks.y[i], peaks.fwhm[i]] as Peak1D)
            : ([x, peaks.y[i]] as Peak1D),
        );

    const resolvedPeaks: ResolvedSparsePeak[] = peakArray
      .map((peak) => {
        const { x0, intensity, shapeLeft, shapeRight } = this.resolvePeak(
          peak,
          peakOptions,
        );
        return {
          x0,
          intensity,
          shapeLeft,
          shapeRight,
          xFrom: x0 - computeHalfWidth(shapeLeft, threshold),
          xTo: x0 + computeHalfWidth(shapeRight, threshold),
        };
      })
      .filter((p) => p.xFrom < this.to && p.xTo > this.from);

    if (resolvedPeaks.length === 0) {
      return {
        x: Float64Array.from([this.from, this.to]),
        y: baseline
          ? Float64Array.from([baseline(this.from), baseline(this.to)])
          : new Float64Array(2),
      };
    }

    for (const peak of resolvedPeaks) {
      peak.xFrom = Math.max(this.from, peak.xFrom);
      peak.xTo = Math.min(this.to, peak.xTo);
    }

    resolvedPeaks.sort((a, b) => a.xFrom - b.xFrom);

    const mergedIntervals: MergedInterval[] = [];
    for (const peak of resolvedPeaks) {
      const last = mergedIntervals.at(-1);
      if (last !== undefined && peak.xFrom <= last.xTo) {
        last.xTo = Math.max(last.xTo, peak.xTo);
        last.peaks.push(peak);
      } else {
        mergedIntervals.push({
          xFrom: peak.xFrom,
          xTo: peak.xTo,
          peaks: [peak],
        });
      }
    }

    const xResult: number[] = [this.from];
    const yResult: number[] = [0];
    // tracks the last grid index written to avoid duplicate guard points when
    // two intervals are only one step apart
    let lastWrittenIndex = 0;

    for (const interval of mergedIntervals) {
      const firstIndex = Math.max(
        0,
        Math.floor((interval.xFrom - this.from) / this.interval),
      );
      const lastIndex = Math.min(
        this.nbPoints - 1,
        Math.ceil((interval.xTo - this.from) / this.interval),
      );

      const guardBefore = firstIndex - 1;
      if (guardBefore >= 0 && guardBefore > lastWrittenIndex) {
        xResult.push(this.from + guardBefore * this.interval);
        yResult.push(0);
        lastWrittenIndex = guardBefore;
      }

      for (let i = firstIndex; i <= lastIndex; i++) {
        const x = this.from + i * this.interval;
        let y = 0;
        for (const peak of interval.peaks) {
          const shape = x < peak.x0 ? peak.shapeLeft : peak.shapeRight;
          y += peak.intensity * shape.fct(x - peak.x0);
        }
        xResult.push(x);
        yResult.push(y);
        lastWrittenIndex = i;
      }

      const guardAfter = lastIndex + 1;
      if (guardAfter < this.nbPoints) {
        xResult.push(this.from + guardAfter * this.interval);
        yResult.push(0);
        lastWrittenIndex = guardAfter;
      }
    }

    if (xResult[0] !== this.from) {
      xResult.unshift(this.from);
      yResult.unshift(0);
    }
    if (xResult[xResult.length - 1] !== this.to) {
      xResult.push(this.to);
      yResult.push(0);
    }

    if (baseline) {
      for (let i = 0; i < yResult.length; i++) {
        yResult[i] += baseline(xResult[i]);
      }
    }

    return {
      x: Float64Array.from(xResult),
      y: Float64Array.from(yResult),
    };
  }
}

/**
 * Finds the half-width d at which shape.fct(d) equals the given threshold via
 * binary search. Works for any monotonically decreasing shape function.
 */
function computeHalfWidth(shape: Shape1DInstance, threshold: number): number {
  if (threshold <= 0) return Infinity;
  if (shape.fct(0) <= threshold) return 0;
  let high = shape.fwhm;
  while (shape.fct(high) > threshold) {
    high *= 2;
  }
  let low = 0;
  for (let i = 0; i < 64; i++) {
    const mid = (low + high) / 2;
    if (shape.fct(mid) > threshold) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}
