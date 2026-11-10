// Bundles and runs the corpus check locally: npm run check:corpus
import { execFileSync } from 'node:child_process';
execFileSync('npx', ['--yes', 'esbuild', 'scripts/check-phala.ts', '--bundle',
  '--platform=node', '--format=cjs', '--outfile=/tmp/corpus.cjs', '--log-level=error'], { stdio: 'inherit' });
execFileSync('node', ['/tmp/corpus.cjs'], { stdio: 'inherit' });
