import { buildPresentations } from './build-presentations.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'vite';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
await buildPresentations();
await build({
  root: projectRoot,
  configFile: join(projectRoot, 'vite.config.js'),
});
