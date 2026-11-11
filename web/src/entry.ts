/**
 * The esbuild entry. Bundles the TypeScript engine into one browser global so
 * the static pages can call it without a framework or a module loader.
 *
 * Built in CI: esbuild web/src/entry.ts --bundle --format=iife
 */

import { calculateFullJyotishaChart } from '../../lib/jyotisha/calculator';
import { buildNarrative } from '../../lib/phalita/phala/narrative';
import { buildDashaPhala } from '../../lib/phalita/phala/dasha';
import { buildReading } from '../../lib/phalita/phala/reading';
import { buildCatalogue } from '../../lib/phalita/phala/catalogue-engine';

(window as unknown as Record<string, unknown>).Phalita = {
  calculateFullJyotishaChart,
  buildNarrative,
  buildDashaPhala,
  buildReading,
  buildCatalogue,
};
