/**
 * PHALITA — the rule layer.
 *
 * Each rule is a condition the texts state, tested against the chart, which
 * produces a finding: what the text PREDICTS for the bhāva, where a rule
 * states one, and the evidence that produced it.
 *
 * `predicts` is deliberately sparse. A dignity, placement, aspect or strength
 * observation is narrower than a prediction about marriage, health, longevity
 * or wealth, and must not be inflated into one. Only a rule whose source states
 * that phala — 12.1 and 12.3 in verse-rules.ts — sets it.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';

export const BEN: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MAL: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const DUS = [6, 8, 12];
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];

/** The bhāva-kāraka: the graha the text makes the natural significator. */
const KARAKA: Record<number, PlanetId> = {
  1: 'sun', 2: 'jupiter', 3: 'mars', 4: 'moon', 5: 'jupiter', 6: 'saturn',
  7: 'venus', 8: 'saturn', 9: 'jupiter', 10: 'sun', 11: 'jupiter', 12: 'saturn',
};

export const BHAVA_MEANING: Record<number, string> = {
  1: 'the body and the self',
  2: 'wealth and speech',
  3: 'siblings and courage',
  4: 'home and mother',
  5: 'children and learning',
  6: 'health, debts and opposition',
  7: 'marriage and partnership',
  8: 'longevity, legacies and the hidden',
  9: 'fortune and father',
  10: 'career and public standing',
  11: 'gains and network',
  12: 'loss, foreign life and renunciation',
};

const name = (p: PlanetId) => GRAHA_PROPERTIES[p]?.name ?? p;
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const dig = (d: string): number => {
  if (/Exalted/.test(d)) return 3;
  if (/Moolatrikona/.test(d)) return 2.5;
  if (/Own Sign/.test(d)) return 2;
  if (/Great Friend/.test(d)) return 1.2;
  if (/Friend/.test(d)) return 0.6;
  if (/Neutral/.test(d)) return 0;
  if (/Great Enemy/.test(d)) return -1.8;
  if (/Enemy/.test(d)) return -1.2;
  if (/Debilitated/.test(d)) return -2.5;
  return 0;
};

export interface Finding {
  text: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
  /** Set only where a rule's source states the phala. Never inferred. */
  predicts?: string;
  /** Set when a severe finding was tested against its compound condition. */
  compound?: 'satisfied' | 'single-condition';
}

export function readBhava(chart: JyotishaChart, h: number): Finding[] {
  const out: Finding[] = [];
  const house = chart.bhavas[h - 1];
  if (!house) return out;
  const lord = house.rashiLord as PlanetId;
  const p = chart.planets[lord];
  const meaning = BHAVA_MEANING[h] ?? 'this matter';

  if (!p) return out;

  const d = dig(p.dignity);
  if (d > 0) {
    out.push({ side: 'a', weight: d, ground: 'Phaladīpikā 15.1',
      text: `The lord of the ${ORD[h]}, ${name(lord)}, is ${p.dignity} in ${p.rashiName} — the strongest support for ${meaning}` });
  } else if (d < 0) {
    out.push({ side: 'b', weight: -d, ground: 'Phaladīpikā 15.1',
      text: `The lord of the ${ORD[h]}, ${name(lord)}, is ${p.dignity} in ${p.rashiName} — this works against ${meaning}` });
  }

  if (DUS.includes(p.house)) {
    out.push({ side: 'b', weight: 2.0, ground: 'Phaladīpikā 15.4',
      text: `The lord of the ${ORD[h]} has fallen into the ${ORD[p.house]}, a duḥsthāna — this obstructs ${meaning} and delays its results` });
  }

  if (KENDRA.includes(p.house)) {
    out.push({ side: 'a', weight: 1.0, ground: 'Phaladīpikā 15.2',
      text: `The lord of the ${ORD[h]} stands in a kendra, the ${ORD[p.house]} — ${meaning} has room to act` });
  }

  if (p.isCombust) {
    out.push({ side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.3',
      text: `The lord of the ${ORD[h]} is burnt by the Sun — its power to deliver ${meaning} is cut down` });
  }

  // Phaladīpikā 9.20: वक्रं गतः स्वोच्चफलं विदध्यात् — a retrograde graha gives
  // its exaltation phala, even in an enemy sign or its debilitation. It
  // strengthens; it does not obstruct. (This previously cited 15.13, the sandhi
  // verse, and read retrograde as adverse — both were wrong.)
  if (p.isRetrograde) {
    out.push({ side: 'a', weight: 1.2, ground: 'Phaladīpikā 9.20',
      text: `The lord of the ${ORD[h]} is retrograde — 9.20 gives a retrograde graha its exaltation phala even in an inimical sign, so ${meaning} acts with more force than the placement alone suggests` });
  }

  const occ = (house.planetsInHouse ?? []) as PlanetId[];
  for (const o of occ) {
    const nm = name(o);
    if (BEN.includes(o)) {
      out.push({ side: 'a', weight: 1.4, ground: 'Phaladīpikā 15.1',
        text: `${nm} occupies the ${ORD[h]} — protection and good company for ${meaning}` });
    } else if (MAL.includes(o)) {
      out.push({ side: 'b', weight: 1.4, ground: 'Phaladīpikā 15.4',
        text: `${nm} occupies the ${ORD[h]} — strain on ${meaning}, and what it promises comes at a cost` });
    }
  }

  for (const b of BEN) {
    if (chart.planets[b]?.aspectsToHouses?.includes(h)) {
      out.push({ side: 'a', weight: 1.2, ground: 'Phaladīpikā 15.2',
        text: `${name(b)} aspects the ${ORD[h]} — ${meaning} is watched over` });
    }
  }
  for (const m of MAL) {
    if (chart.planets[m]?.aspectsToHouses?.includes(h)) {
      out.push({ side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.4',
        text: `${name(m)} aspects the ${ORD[h]} — malefic pressure on ${meaning}` });
    }
  }

  const karaka = KARAKA[h];
  if (karaka && karaka !== lord) {
    const kd = dig(chart.planets[karaka]?.dignity ?? '');
    if (kd > 0) {
      out.push({ side: 'a', weight: kd * 0.7, ground: 'Phaladīpikā 15.25',
        text: `The kāraka of the ${ORD[h]}, ${name(karaka)}, is ${chart.planets[karaka]?.dignity} — the natural significator of ${meaning} is itself strong` });
    } else if (kd < 0) {
      out.push({ side: 'b', weight: -kd * 0.7, ground: 'Phaladīpikā 15.25',
        text: `The kāraka of the ${ORD[h]}, ${name(karaka)}, is ${chart.planets[karaka]?.dignity} — the natural significator of ${meaning} is itself weak` });
    }
  }

  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const mine = sb[lord]?.totalVirupas ?? 0;
  const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vals = seven.map((x) => sb[x]?.totalVirupas ?? 0).filter((v) => v > 0);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (mean > 0 && mine > 0) {
    if (mine > mean * 1.15) {
      out.push({ side: 'a', weight: 1.0, ground: 'Phaladīpikā 15.9',
        text: `The lord of the ${ORD[h]} carries ${Math.round(mine)} virūpas against a mean of ${Math.round(mean)} — ${meaning} can be pushed through` });
    } else if (mine < mean * 0.85) {
      out.push({ side: 'b', weight: 1.0, ground: 'Phaladīpikā 15.9',
        text: `The lord of the ${ORD[h]} carries only ${Math.round(mine)} virūpas against a mean of ${Math.round(mean)} — ${meaning} is under-resourced` });
    }
  }

  const relOf = (x: number) => ((x - h + 12) % 12) + 1;
  for (const b of BEN) {
    const bh = chart.planets[b]?.house;
    if (bh && TRIKONA.includes(relOf(bh)) && bh !== h) {
      out.push({ side: 'a', weight: 1.3, ground: 'Phaladīpikā 15.2',
        text: `${name(b)} stands in the ${ORD[relOf(bh)]} from the ${ORD[h]} — a trine support to ${meaning}` });
    }
  }
  for (const m of MAL) {
    const mh = chart.planets[m]?.house;
    if (mh && [6, 8, 12].includes(relOf(mh))) {
      out.push({ side: 'b', weight: 1.3, ground: 'Phaladīpikā 15.4',
        text: `${name(m)} stands in the ${ORD[relOf(mh)]} from the ${ORD[h]} — this damages ${meaning}` });
    }
  }

  // Do not attach a generic whole-house life outcome to every finding.
  // A dignity, placement, aspect or strength observation is narrower than a
  // prediction about marriage, health, longevity or wealth. `predicts` is
  // populated only by a rule whose source states that phala and whose
  // conditions were met — see verse-rules.ts.
  return applyCompoundGate(out, chart, h);
}

/** Read several bhāvas and combine their findings. */
export function readBhavas(chart: JyotishaChart, houses: number[]): Finding[] {
  const out: Finding[] = [];
  for (const h of houses) out.push(...readBhava(chart, h));
  return out;
}

/**
 * The compound gate — Phaladīpikā 15.3 and 15.6, and MOD02 of the audit.
 */
function applyCompoundGate(out: Finding[], chart: JyotishaChart, h: number): Finding[] {
  const house = chart.bhavas[h - 1];
  if (!house) return out;
  const lord = house.rashiLord as PlanetId;
  const p = chart.planets[lord];
  const occ = (house.planetsInHouse ?? []) as PlanetId[];

  let afflictions = 0;
  if (p) {
    if (DUS.includes(p.house)) afflictions += 1;
    if (p.isCombust) afflictions += 1;
    if (p.dignity === 'Debilitated (Neecha)' || p.dignity.startsWith('Enemy') || p.dignity.startsWith('Great Enemy')) afflictions += 1;
  }

  let beneficSupport = 0;
  for (const b of BEN) {
    if (occ.includes(b)) beneficSupport += 1;
    if (chart.planets[b]?.aspectsToHouses?.includes(h)) beneficSupport += 1;
  }

  return out.map((f) => {
    if (f.side !== 'b') return f;
    if (!/duḥsthāna|fallen|inimical/i.test(f.text)) return f;
    const satisfied = afflictions >= 2 && beneficSupport === 0;
    return {
      ...f,
      weight: satisfied ? f.weight : f.weight * 0.4,
      compound: satisfied ? 'satisfied' : 'single-condition',
      text: satisfied
        ? f.text
        : `${f.text} — a single condition, which 15.3 and 15.6 do not allow to stand alone`,
    };
  });
}
