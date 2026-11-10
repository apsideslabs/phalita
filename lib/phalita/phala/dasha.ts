/**
 * PHALITA — daśā phala, the period result (Phaladīpikā 19).
 *
 * A prediction without a period is only half a prediction. This module reads
 * the mahādaśā running on a given date out of the chart's viṃśottarī tree and
 * gives the phala the text assigns to that lord.
 *
 * 19.8 governs every reading here: the phala is to be read according to the
 * graha's strength. So the same daśā is not the same for two natives, and the
 * card states which way the lord's ṣaḍbala leans.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { getCurrentActiveDasha, parseDashaDate } from '@/lib/dashas/vimshottari';
import { citationOf } from './engine';
import type { PhalaStatement } from './types';

/** The verse that gives each graha's daśā phala. */
const DASHA_VERSE: Partial<Record<PlanetId, string>> = {
  sun: 'phaladipika.19.5',
  moon: 'phaladipika.19.7',
  mars: 'phaladipika.19.9',
  mercury: 'phaladipika.19.10',
  jupiter: 'phaladipika.19.11',
  venus: 'phaladipika.19.12',
  saturn: 'phaladipika.19.13',
  rahu: 'phaladipika.19.15',
  ketu: 'phaladipika.19.17',
};

export interface DashaPhala {
  mahadasha: { lord: PlanetId; name: string; start: string; end: string };
  antardasha: { lord: PlanetId; name: string; start: string; end: string } | null;
  statement: PhalaStatement | null;
  /** Whether the lord is above or below the mean ṣaḍbala, per 19.8. */
  strength: { label: string; delta: number; note: string };
  /** True when the text gives no daśā phala for this lord. */
  unstated?: string;
}

const fmt = (ts: number) =>
  Number.isFinite(ts)
    ? new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export function buildDashaPhala(chart: JyotishaChart, date: Date = new Date()): DashaPhala {
  const tree = chart.vimshottari?.tree ?? [];
  const active = tree.length ? getCurrentActiveDasha(tree, date) : null;

  const maha = active?.mahadasha;
  const antar = active?.antardasha;
  const lord = (maha?.lord ?? chart.planets.moon.id) as PlanetId;
  const name = GRAHA_PROPERTIES[lord]?.name ?? lord;

  // 19.8 — read the phala by the graha's strength.
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vals = seven.map((g) => sb[g]?.totalVirupas ?? 0).filter((v) => v > 0);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const mine = sb[lord]?.totalVirupas ?? 0;
  const delta = mean > 0 && mine > 0 ? Math.round(((mine - mean) / mean) * 100) : 0;

  const strength = {
    label: delta >= 8 ? 'above the mean' : delta <= -8 ? 'below the mean' : 'near the mean',
    delta,
    note:
      delta >= 8
        ? `${name} runs at ${mine.toFixed(0)} virūpas against a mean of ${mean.toFixed(0)} — the text reads the daśā phala at its fuller strength.`
        : delta <= -8
        ? `${name} runs at ${mine.toFixed(0)} virūpas against a mean of ${mean.toFixed(0)} — the text reads the daśā phala at less than its full strength.`
        : `${name} runs at ${mine.toFixed(0)} virūpas against a mean of ${mean.toFixed(0)} — neither strengthened nor weakened, so the phala is read as stated.`,
  };

  const verseId = DASHA_VERSE[lord];
  if (!verseId) {
    return {
      mahadasha: {
        lord,
        name,
        start: maha ? fmt(parseDashaDate(maha.startDate)) : '—',
        end: maha ? fmt(parseDashaDate(maha.endDate)) : '—',
      },
      antardasha: antar
        ? {
            lord: antar.lord,
            name: GRAHA_PROPERTIES[antar.lord]?.name ?? antar.lord,
            start: fmt(parseDashaDate(antar.startDate)),
            end: fmt(parseDashaDate(antar.endDate)),
          }
        : null,
      statement: null,
      strength,
      unstated: `Phaladīpikā 19 gives no daśā phala for ${name} in this corpus.`,
    };
  }

  const statement: PhalaStatement = {
    phala: `In the daśā of ${name}, the text gives the results of 19.${
      verseId.split('.').pop()
    } — read at ${strength.label}.`,
    tone:
      lord === 'sun' || lord === 'mars' || lord === 'saturn' || lord === 'ketu' || lord === 'rahu'
        ? 'mishra'
        : 'shubha',
    keywords: [`${name} daśā`],
    citation: citationOf(verseId),
    modifiedBy: [
      {
        verseId: 'phaladipika.19.8',
        short: 'Phaladīpikā 19.8',
        effect: 'reinforced',
        detail: strength.note,
      },
    ],
  };

  return {
    mahadasha: {
      lord,
      name,
      start: maha ? fmt(parseDashaDate(maha.startDate)) : '—',
      end: maha ? fmt(parseDashaDate(maha.endDate)) : '—',
    },
    antardasha: antar
      ? {
          lord: antar.lord,
          name: GRAHA_PROPERTIES[antar.lord]?.name ?? antar.lord,
          start: fmt(parseDashaDate(antar.startDate)),
          end: fmt(parseDashaDate(antar.endDate)),
        }
      : null,
    statement,
    strength,
  };
}
