import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands/*.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  noExternal: ['*'],
  sourcemap: true,
  clean: true,
  shims: true,
  minify: false,
  treeshake: true,
  target: 'node16',
  outDir: 'dist',
  esbuildOptions(options) {
    options.banner = {
      js: '#!/usr/bin/env node',
    };
  },
});
