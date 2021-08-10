export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'lib/index.js',
  },
  external: [
    'd3-random',
    'ml-peak-shape-generator',
    'ml-xsadd',
  ],
};
