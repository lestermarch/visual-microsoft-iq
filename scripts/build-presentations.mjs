import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const presentationIds = ['work-iq', 'fabric-iq', 'foundry-iq', 'web-iq', 'security-governance'];

for (const id of presentationIds) {
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
