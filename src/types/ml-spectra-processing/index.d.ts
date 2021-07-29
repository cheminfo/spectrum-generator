declare module 'ml-spectra-processing' {
  function xyMaxYPoint(data: { x: Float64Array | number[]; y: Float64Array | number[] }): {
    x: number;
    y: number;
    index: number;
  };
}
