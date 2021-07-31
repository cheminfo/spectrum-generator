type gaussianFct = (x: number, fwhm: number) => number;

declare module 'ml-peak-shape-generator' {
  function getShapeGenerator(options?: { kind?: string; options?: any }): any;

  class Gaussian {
    public fct: gaussianFct
    public getArea: any;
  }
}
