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
import { DOMAINS } from '../../lib/phalita/phala/catalogue';
import { analyzeChart as analyzeSmartChart } from '../../lib/jyotisha/inference-engine';
import type { AnalyzeOptions } from '../../lib/jyotisha/inference-engine';

/**
 * The existing reading plus the new inference report, side by side.
 *
 * The legacy reading is passed in as `legacyReading` so the inference engine can
 * quarantine it as legacy_corpus_statement evidence rather than treat it as
 * newly validated. Nothing in the existing reading changes.
 */
const buildSmartReading = (
  chart: Parameters<typeof buildReading>[0],
  date: Date = new Date(),
  options: Omit<AnalyzeOptions, 'referenceDate' | 'legacyReading'> = {},
) => {
  const reading = buildReading(chart, date);
  const inference = analyzeSmartChart(chart, { ...options, referenceDate: date, legacyReading: reading });
  return { reading, inference };
};

(window as unknown as Record<string, unknown>).Phalita = {
  calculateFullJyotishaChart,
  buildNarrative,
  buildDashaPhala,
  buildReading,
  buildCatalogue,
  DOMAINS,
  buildSmartReading,
  analyzeChart: analyzeSmartChart,
};
