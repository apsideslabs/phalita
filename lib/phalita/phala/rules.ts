/**
 * PHALITA — the rule layer.
 *
 * Each rule is a condition the texts state, tested against the chart, which
 * produces a CONCRETE finding — the planet, its sign, its house, and what the
 * text says that means for the bhāva in question. Not "supported by verse 12",
 * but "the lord of the 4th, Venus, sits exalted in Pisces in the 9th, so the
 * home is strongly founded".
 *
 * The verse is carried in the factor list as provenance. The sentence is the
 * reading.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '@/lib/jyotisha/constants';

export const BEN: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
export const MAL: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const DUS = [6, 8, 12];
const KENDRA = [1, 4, 7, 10];

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

/** What each bhāva governs, in the words a reading would use. */
export const BHAVA_MEANING: Record<number, string> = {
  1: 'the body and the self',
  2: 'wealth, speech and family resources',
  3: 'siblings, courage and effort',
  4: 'home, mother and property',
  5: 'children, learning and creative work',
  6: 'health, debts and opposition',
  7: 'marriage and partnership',
  8: 'longevity, legacies and the hidden',
  9: 'fortune, father and higher learning',
  10: 'career and public standing',
  11: 'gains and networks',
  12: 'loss, foreign life and renunciation',
};

const name = (p: PlanetId) => GRAHA_PROPERTIES[p]?.name ?? p;

export interface Finding {
  text: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
}

/**
 * Read one bhāva: every condition of the text that applies, turned into a
 * sentence about this chart.
 */
export function readBhava(chart: JyotishaChart, h: number): Finding[] {
  const out: Finding[] = [];
  const house = chart.bhavas[h - 1];
  if (!house) return out;

  const lord = house.rashiLord as PlanetId;
  const p = chart.planets[lord];
  const occ = (house.planetsInHouse ?? []) as PlanetId[];
  const meaning = BHAVA_MEANING[h] ?? `the ${ORD[h]} bhāva`;
  const sign = RASHIS[p?.rashiNumber ?? 1]?.name ?? '';

  if (p) {
    const d = p.dignity;
    if (d === 'Exalted (Ucca)') {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, is exalted in ${sign} — the strongest support for ${meaning}`, side: 'a', weight: 3, ground: 'Phaladīpikā 15.2, a dignified lord supports its bhāva' });
    } else if (d === 'Own Sign (Swakshetra)' || d === 'Moolatrikona') {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, is in its own sign in the ${ORD[p.house]} — ${meaning} rests on solid ground`, side: 'a', weight: 2.4, ground: 'Phaladīpikā 15.2' });
    } else if (d.startsWith('Great Friend') || d.startsWith('Friend')) {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, is in a friendly sign in the ${ORD[p.house]} — ${meaning} is supported`, side: 'a', weight: 1.6, ground: 'Phaladīpikā 15.2' });
    } else if (d === 'Debilitated (Neecha)') {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, is debilitated in ${sign} — ${meaning} is weak at the root`, side: 'b', weight: 2.8, ground: 'Phaladīpikā 15.3' });
    } else if (d.startsWith('Great Enemy') || d.startsWith('Enemy')) {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, sits in an inimical sign in the ${ORD[p.house]} — ${meaning} works against the grain`, side: 'b', weight: 2, ground: 'Phaladīpikā 15.3' });
    }

    if (DUS.includes(p.house)) {
      out.push({ text: `the lord of the ${ORD[h]} has fallen into the ${ORD[p.house]}, a duḥsthāna — this obstructs ${meaning} and delays its results`, side: 'b', weight: 2, ground: 'Phaladīpikā 15.19' });
    } else if (KENDRA.includes(p.house)) {
      out.push({ text: `the lord of the ${ORD[h]} stands in the ${ORD[p.house]}, a kendra — ${meaning} has room to act`, side: 'a', weight: 1.2, ground: 'Phaladīpikā 15.20' });
    }

    if (p.isCombust) {
      out.push({ text: `the lord of the ${ORD[h]}, ${name(lord)}, is burnt by the Sun — its power is cut down, and ${meaning} loses force`, side: 'b', weight: 1.5, ground: 'Phaladīpikā 15.9' });
    }
    if (p.isRetrograde) {
      out.push({ text: `the lord of the ${ORD[h]} is retrograde — ${meaning} returns and repeats rather than settling once`, side: 'b', weight: 0.8, ground: 'Phaladīpikā 15.10' });
    }
  }

  for (const o of occ) {
    if (BEN.includes(o)) {
      out.push({ text: `${name(o)} occupies the ${ORD[h]} — protection and good company for ${meaning}`, side: 'a', weight: 1.8, ground: 'Phaladīpikā 15.1' });
    }
  }
  for (const o of occ) {
    if (MAL.includes(o)) {
      out.push({ text: `${name(o)} sits in the ${ORD[h]} — strain on ${meaning}, and what it promises comes with cost`, side: 'b', weight: 1.8, ground: 'Phaladīpikā 15.1' });
    }
  }

  const bAsp = BEN.filter((b) => (chart.planets[b].aspectsToHouses ?? []).includes(h));
  const mAsp = MAL.filter((m) => (chart.planets[m].aspectsToHouses ?? []).includes(h));
  if (bAsp.length) {
    out.push({ text: `${bAsp.map(name).join(' and ')} ${bAsp.length > 1 ? 'aspect' : 'aspects'} the ${ORD[h]} — ${meaning} is watched over`, side: 'a', weight: 1.4, ground: 'Phaladīpikā 15.1' });
  }
  if (mAsp.length) {
    out.push({ text: `${mAsp.map(name).join(' and ')} ${mAsp.length > 1 ? 'aspect' : 'aspects'} the ${ORD[h]} — ${meaning} is pressed on by malefics`, side: 'b', weight: 1.4, ground: 'Phaladīpikā 15.1' });
  }

  // The lord's ṣaḍbala against the mean of the seven.
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vals = seven.map((g) => sb[g]?.totalVirupas ?? 0).filter((v) => v > 0);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const mine = sb[lord]?.totalVirupas ?? 0;
  if (mean > 0 && mine > 0) {
    const delta = Math.round(((mine - mean) / mean) * 100);
    if (delta >= 15) {
      out.push({ text: `${name(lord)} carries ${mine.toFixed(0)} virūpas against a mean of ${mean.toFixed(0)} — it is one of the stronger grahas in this chart, so ${meaning} can be pushed through`, side: 'a', weight: 1.6, ground: 'Phaladīpikā 4.1–4, ṣaḍbala' });
    } else if (delta <= -15) {
      out.push({ text: `${name(lord)} carries only ${mine.toFixed(0)} virūpas against a mean of ${mean.toFixed(0)} — it is weak in this chart, so ${meaning} does not carry far on its own`, side: 'b', weight: 1.6, ground: 'Phaladīpikā 4.1–4, ṣaḍbala' });
    }
  }

  return out;
}

/** Every bhāva a question names, read together. */
export function readBhavas(chart: JyotishaChart, bhavas: number[]): Finding[] {
  const seen = new Set<string>();
  const all: Finding[] = [];
  for (const h of bhavas) {
    for (const f of readBhava(chart, h)) {
      if (seen.has(f.text)) continue;
      seen.add(f.text);
      all.push(f);
    }
  }
  return all;
}
