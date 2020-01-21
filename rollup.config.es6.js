// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/select.svelte',
  output: {
    sourcemap: false,
    format: 'esm',
    name: 'Select',
    file: 'dist/select_svelte.es6'
  },
  plugins: [
    svelte({
      dev: false,
    }),
    resolve(),
  ]
};
