import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { build } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { presentations } from '../src/catalog.js';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export async function buildPresentations() {
  for (const { id } of presentations) {
    await build({
      root: join(projectRoot, 'presentations', id),
      configFile: false,
      base: './',
      plugins: [viteSingleFile()],
      build: {
        outDir: join(projectRoot, '.generated', id),
        emptyOutDir: true,
        target: 'es2022',
        chunkSizeWarningLimit: 700,
      },
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await buildPresentations();
}
