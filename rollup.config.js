// rollup.config.js
//import * as fs from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
//import { scss } from 'svelte-preprocess';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/select.svelte',
  output: {
    sourcemap: false,
    format: 'iife',
    name: 'Select',
    file: 'dist/select_svelte.js',
//    globals: {
//      'svelte': 'svelte',
//      'svelte/internal': 'internal'
//    }
  },
  plugins: [
    svelte({
      // By default, all .svelte and .html files are compiled
//      extensions: ['.my-custom-extension'],
      dev: false,

      // You can restrict which files are compiled
      // using `include` and `exclude`
//      include: 'src/**/*.svelte',

      // By default, the client-side compiler is used. You
      // can also use the server-side rendering compiler
//      generate: 'ssr',

      // Optionally, preprocess components with svelte.preprocess:
      // https://svelte.dev/docs#svelte_preprocess
//      preprocess: [
//        scss({ }),
//      ],

      // Emit CSS as "files" for other plugins to process
//      emitCss: false,

      // Extract CSS into a separate file (recommended).
      // See note below

/*      css: function (css) {
//        console.log(css.code); // the concatenated CSS
//        console.log(css.map); // a sourcemap

        // creates `main.css` and `main.css.map` — pass `false`
        // as the second argument if you don't want the sourcemap
        css.write('dist/select_svelte.css', false);
      },
*/
      // Warnings are normally passed straight to Rollup. You can
      // optionally handle them here, for example to squelch
      // warnings with a particular code
/*
      onwarn: (warning, handler) => {
        // e.g. don't warn on <marquee> elements, cos they're cool
        if (warning.code === 'a11y-distracting-elements') return;

        // let Rollup handle all other warnings normally
        handler(warning);
      }
*/
    }),
    resolve(),
    commonjs(),
    babel({
      extensions: [ '.js', '.mjs', '.html', '.svelte' ],
      runtimeHelpers: true,
      exclude: [ 'node_modules/@babel/**', 'node_modules/core-js/**' ],
      presets: [
        [
          '@babel/preset-env',
          // {
          //   targets: {
          //     ie: '11'
          //   },
          //   useBuiltIns: 'usage',
          //   corejs: 3
          // }
        ]
      ],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: true
          }
        ]
      ]
    }),
    copy({
      targets: [
        { src: 'src/_select_svelte.scss', dest: 'dist' },
      ]
    })

  ]
};
