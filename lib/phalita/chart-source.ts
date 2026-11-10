/**
 * PHALITA — chart source.
 *
 * PHALITA is a prediction platform: the chart is an input, never a screen. This
 * module is the only place that produces one, and it has two interchangeable
 * implementations:
 *
 *   remote — POST the birth data to a GAṆAKA endpoint and take the chart back.
 *            Used when NEXT_PUBLIC_GANAKA_API is set.
 *   local  — run the GAṆAKA engine that is bundled in this repository.
 *
 * Why both. GAṆAKA is deployed as a static export on GitHub Pages, so it has no
 * server and therefore no API today: `output: 'export'` cannot serve a POST
 * route. The remote path is written and tested against the same chart shape, so
 * pointing PHALITA at a GAṆAKA deployment that does have a server is a one-line
 * environment change, not a refactor. Until then the local path keeps the
 * platform working with no backend at all.
 *
 * The contract for the remote endpoint:
 *
 *   POST <NEXT_PUBLIC_GANAKA_API>/chart
 *   body: BirthInput (see below)
 *   200: { chart: JyotishaChart }
 *   any other status: PHALITA falls back to the local engine and records why.
 */

import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateFullJyotishaChart } from '@/lib/jyotisha/calculator';
import type { AyanamshaType } from '@/lib/astronomy/ayanamsha';

export interface BirthInput {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  locationName: string;
  ayanamshaType?: AyanamshaType;
  houseSystem?: 'equal_whole' | 'sripati' | 'placidus';
}

export interface ChartResult {
  chart: JyotishaChart;
  /** Which implementation produced it — shown nowhere in the UI, logged for support. */
  source: 'remote-ganaka' | 'local-engine';
  /** Set when the remote path was configured but failed. */
  fallbackReason?: string;
}

const ENDPOINT = process.env.NEXT_PUBLIC_GANAKA_API || '';

export function hasRemoteEngine(): boolean {
  return Boolean(ENDPOINT);
}

/**
 * Compute the chart. Synchronous on the local path, so callers do not have to
 * care which implementation is in use.
 */
export function computeChart(input: BirthInput): ChartResult {
  // The local engine is the default and the fallback; the remote call is async
  // and handled in computeChartAsync below for callers that can await.
  const chart = calculateFullJyotishaChart({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    second: input.second ?? 0,
    latitude: input.latitude,
    longitude: input.longitude,
    timezoneOffsetHours: input.timezoneOffsetHours,
    locationName: input.locationName,
    ayanamshaType: input.ayanamshaType,
    houseSystem: input.houseSystem,
  } as never);

  return { chart, source: 'local-engine' };
}

/** Async form: prefers the GAṆAKA endpoint when one is configured. */
export async function computeChartAsync(input: BirthInput): Promise<ChartResult> {
  if (!ENDPOINT) return computeChart(input);

  try {
    const res = await fetch(`${ENDPOINT.replace(/\/$/, '')}/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      return { ...computeChart(input), fallbackReason: `GAṆAKA endpoint returned ${res.status}` };
    }
    const data = (await res.json()) as { chart?: JyotishaChart };
    if (!data?.chart?.planets || !data?.chart?.lagna) {
      return { ...computeChart(input), fallbackReason: 'GAṆAKA endpoint returned no chart' };
    }
    return { chart: data.chart, source: 'remote-ganaka' };
  } catch (err) {
    return {
      ...computeChart(input),
      fallbackReason: err instanceof Error ? err.message : 'GAṆAKA endpoint unreachable',
    };
  }
}
