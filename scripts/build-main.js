import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build main process
await build({
  entryPoints: [path.resolve(__dirname, '../src/main/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['electron'],
  outfile: path.resolve(__dirname, '../dist/main/index.js'),
  format: 'esm',
  sourcemap: true,
});

// Build preload script
await build({
  entryPoints: [path.resolve(__dirname, '../src/main/preload.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['electron'],
  outfile: path.resolve(__dirname, '../dist/main/preload.js'),
  format: 'cjs', // Preload scripts need to be CommonJS
  sourcemap: true,
});

console.log('Main process build complete!');