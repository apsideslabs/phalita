import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  site: 'https://apsideslabs.github.io',
  base: '/phalita',
  outDir: './dist',
  vite: {
    resolve: {
      alias: {
        // The engine imports its own modules as '@/lib/...'. Point that at the
        // repository root so the same source compiles here unchanged.
        '@': repoRoot,
      },
    },
  },
});
