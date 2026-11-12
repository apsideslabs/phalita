/**
 * PHALITA — the rule layer.
 *
 * Each rule is a condition the texts state, tested against the chart. A finding
 * carries the condition, the phala the verse gives for it where the corpus
 * states one, and the verse itself.
 *
 * `predicts` is set only from verses-phala.ts — never inferred from a placement.
 * Occupant and aspect findings contribute weight and name their general verse;
 * the lord's line carries the prediction, because that is what the phala
 * verses in chapter 16 are about.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { phalaFor, RETROGRADE } from './verses-phala';

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
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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
  /** Set only where a verse states the phala. Never inferred. */
  predicts?: string;
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
  const inDust = DUS.includes(p.house);
  const inKendra = KENDRA.includes(p.house);

  // ---- the lord: ONE finding --------------------------------------------
  // Placement decides over dignity, because 16.4 does (सुस्थे सुखी /
  // दुःस्थे दुःखी). Dignity is named, but there is a single verdict.
  if (inDust || d !== 0 || inKendra) {
    const side: 'a' | 'b' = inDust ? 'b' : d < 0 ? 'b' : 'a';
    const line = phalaFor(h, side);
    const dignityText = `${p.dignity} in ${p.rashiName}`;
    let text: string;
    if (inDust) {
      text = d > 0
        ? `The lord of the ${ORD[h]}, ${name(lord)}, is ${dignityText} but has fallen into the ${ORD[p.house]}`
        : `The lord of the ${ORD[h]}, ${name(lord)}, is ${dignityText} and has fallen into the ${ORD[p.house]}`;
    } else if (d < 0) {
      text = `The lord of the ${ORD[h]}, ${name(lord)}, is ${dignityText}`;
    } else if (d > 0) {
      text = `The lord of the ${ORD[h]}, ${name(lord)}, is ${dignityText}`;
    } else {
      text = `The lord of the ${ORD[h]}, ${name(lord)}, is ${dignityText}, neither strengthened nor spoilt by it`;
    }
    if (line) text += ` — ${line.verse} reads that as ${line.phala}`;
    else text += ` — the corpus carries no phala verse for the ${ORD[h]}, so this is recorded as a condition only`;

    out.push({
      side,
      weight: inDust ? 2.0 : Math.max(0.8, Math.abs(d)),
      ground: line ? `Phaladīpikā ${line.verse.split('.').slice(1).join('.')}` : 'Phaladīpikā 15.1',
      predicts: line ? cap(line.phala) + '.' : undefined,
      text,
    });
  }

  // ---- combustion --------------------------------------------------------
  if (p.isCombust) {
    out.push({ side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.3',
      text: `The lord of the ${ORD[h]} is burnt by the Sun — its power to deliver ${meaning} is cut down` });
  }

  // ---- retrograde: 9.20, a strengthening ---------------------------------
  if (p.isRetrograde) {
    out.push({ side: 'a', weight: 1.2, ground: 'Phaladīpikā 9.20',
      predicts: cap(RETROGRADE.phala) + '.',
      text: `The lord of the ${ORD[h]} is retrograde — ${RETROGRADE.verse} gives a retrograde graha the phala of its exaltation, even in an inimical sign` });
  }

  // ---- occupants ---------------------------------------------------------
  const occ = (house.planetsInHouse ?? []) as PlanetId[];
  for (const o of occ) {
    if (o === lord) continue;
    const nm = name(o);
    if (BEN.includes(o)) {
      out.push({ side: 'a', weight: 1.4, ground: 'Phaladīpikā 15.1',
        text: `${nm}, a benefic, occupies the ${ORD[h]} — 15.1 counts benefic association as support for ${meaning}` });
    } else if (MAL.includes(o)) {
      out.push({ side: 'b', weight: 1.4, ground: 'Phaladīpikā 15.4',
        text: `${nm}, a malefic, occupies the ${ORD[h]} — 15.4 counts malefic occupancy as pressure on ${meaning}` });
    }
  }

  // ---- aspects -----------------------------------------------------------
  for (const b of BEN) {
    if (chart.planets[b]?.aspectsToHouses?.includes(h)) {
      out.push({ side: 'a', weight: 1.2, ground: 'Phaladīpikā 15.2',
        text: `${name(b)} aspects the ${ORD[h]} — 15.2 counts a benefic aspect as support` });
    }
  }
  for (const m of MAL) {
    if (chart.planets[m]?.aspectsToHouses?.includes(h)) {
      out.push({ side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.4',
        text: `${name(m)} aspects the ${ORD[h]} — 15.4 counts a malefic aspect as pressure` });
    }
  }

  // ---- kāraka ------------------------------------------------------------
  const karaka = KARAKA[h];
  if (karaka && karaka !== lord) {
    const kd = dig(chart.planets[karaka]?.dignity ?? '');
    if (kd > 0) {
      out.push({ side: 'a', weight: kd * 0.7, ground: 'Phaladīpikā 15.25',
        text: `The kāraka of the ${ORD[h]}, ${name(karaka)}, is ${chart.planets[karaka]?.dignity} — 15.25 reads a strong significator as support` });
    } else if (kd < 0) {
      out.push({ side: 'b', weight: -kd * 0.7, ground: 'Phaladīpikā 15.25',
        text: `The kāraka of the ${ORD[h]}, ${name(karaka)}, is ${chart.planets[karaka]?.dignity} — 15.25 reads a weak significator as a limit` });
    }
  }

  // ---- strength ----------------------------------------------------------
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const mine = sb[lord]?.totalVirupas ?? 0;
  const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vals = seven.map((x) => sb[x]?.totalVirupas ?? 0).filter((v) => v > 0);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (mean > 0 && mine > 0) {
    if (mine > mean * 1.15) {
      out.push({ side: 'a', weight: 1.0, ground: 'Phaladīpikā 15.9',
        text: `The lord carries ${Math.round(mine)} virūpas against a mean of ${Math.round(mean)} — 15.9 reads a strong lord as holding the defect small` });
    } else if (mine < mean * 0.85) {
      out.push({ side: 'b', weight: 1.0, ground: 'Phaladīpikā 15.9',
        text: `The lord carries only ${Math.round(mine)} virūpas against a mean of ${Math.round(mean)} — 15.9 reads a weak lord as multiplying the fault` });
    }
  }

  // ---- relative houses ---------------------------------------------------
  const relOf = (x: number) => ((x - h + 12) % 12) + 1;
  for (const b of BEN) {
    const bh = chart.planets[b]?.house;
    if (bh && TRIKONA.includes(relOf(bh)) && bh !== h) {
      out.push({ side: 'a', weight: 1.3, ground: 'Phaladīpikā 15.2',
        text: `${name(b)} stands in the ${ORD[relOf(bh)]} from the ${ORD[h]} — a trine, which 15.2 counts as support` });
    }
  }
  for (const m of MAL) {
    const mh = chart.planets[m]?.house;
    if (mh && DUS.includes(relOf(mh))) {
      out.push({ side: 'b', weight: 1.3, ground: 'Phaladīpikā 15.4',
        text: `${name(m)} stands in the ${ORD[relOf(mh)]} from the ${ORD[h]} — 15.4 counts that as damage` });
    }
  }

  return applyCompoundGate(out, chart, h);
}

/** Read several bhāvas and combine their findings. */
export function readBhavas(chart: JyotishaChart, houses: number[]): Finding[] {
  const out: Finding[] = [];
  for (const h of houses) out.push(...readBhava(chart, h));
  return out;
}

/**
 * The compound gate — Phaladīpikā 15.3 and 15.6.
 *
 * A severe reading needs independent conditions, not one planet counted thrice.
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
