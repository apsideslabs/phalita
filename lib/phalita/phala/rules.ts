/**
 * PHALITA — the rule layer.
 *
 * Each rule is a condition the texts state, tested against the chart, which
 * produces a finding carrying two things: what the text PREDICTS for the bhāva,
 * and the evidence that produced it.
 *
 * The prediction is the reading. The evidence is why it holds.
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

/** What the text predicts for a bhāva when it is well held, and when it is not. */
const OUTCOME: Record<number, { good: string; bad: string }> = {
  1: { good: 'Your body holds up and you recover quickly; people read you as capable before you speak.', bad: 'Vitality runs below your apparent strength, and energy has to be managed rather than spent.' },
  2: { good: 'You keep what you earn; your word carries weight in money matters and you see a financial situation before others do.', bad: 'Money leaks, income stays short, and family resources do not back you.' },
  3: { good: 'You rise with a network rather than alone, and courage comes easily.', bad: 'Siblings and peers are a point of loss rather than support; you build courage on your own.' },
  4: { good: 'A good house, vehicles and domestic peace accumulate; the family home becomes your base.', bad: 'Property is damaged, lost or delayed, and domestic peace has to be built rather than inherited.' },
  5: { good: 'Children, learning and creative work come easily, and your intelligence is the strongest thing you own.', bad: 'Children are delayed or a source of worry, and study is broken rather than completed.' },
  6: { good: 'Illness does not take root, and rivals weaken on their own.', bad: 'Health, debt and open opposition take up more of life than they should.' },
  7: { good: 'Marriage and partnership settle and hold, and partners add to what you build.', bad: 'Marriage is delayed or strained, and partnerships cost more than they return.' },
  8: { good: 'Life runs long and without chronic obstruction; legacies and hidden resources reach you.', bad: 'Sudden turns, losses through others, and what is hidden stays hidden from you.' },
  9: { good: 'Fortune, father and higher learning open doors; you are helped by people above you.', bad: 'Fortune is thin, the father is distant or lost early, and higher learning is cut short.' },
  10: { good: 'Career is where you are strongest — standing, reputation and material fortune come through public work.', bad: 'Work goes unrecognised and advancement stalls; effort returns less than it should.' },
  11: { good: 'Gains arrive steadily and through people you already know.', bad: 'Gains are contested or blocked, and income does not exceed need.' },
  12: { good: 'Loss is light, and foreign life or retreat opens rather than costs you.', bad: 'Expenditure outruns income, and life pulls you away from where you belong.' },
};

const name = (p: PlanetId) => GRAHA_PROPERTIES[p]?.name ?? p;

/**
 * The bhāva-kāraka: the graha the text makes the natural significator of each
 * house. Phaladīpikā 15.15–17 keeps this as a layer separate from the lord, and
 * 15.20–25 says the bhāva, its lord and its kāraka are judged together.
 */
const KARAKA: Record<number, PlanetId> = {
  1: 'sun', 2: 'jupiter', 3: 'mars', 4: 'moon', 5: 'jupiter', 6: 'mars',
  7: 'venus', 8: 'saturn', 9: 'jupiter', 10: 'sun', 11: 'jupiter', 12: 'saturn',
};

/** Position of house x counted from house h as the reference ascendant. */
const rel = (x: number, h: number) => ((x - h + 12) % 12) + 1;

export interface Finding {
  text: string;
  /** What the text predicts, in plain language. This is the reading. */
  predicts?: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
  /** Set when a severe finding was tested against its compound condition. */
  compound?: 'satisfied' | 'single-condition';
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

  // ---- PH15.2 and PH15.4: count relative houses from the queried bhāva. ----
  for (const b of BEN) {
    const r = rel(chart.planets[b].house, h);
    if (r === 1) continue;
    if ([5, 9].includes(r)) {
      out.push({ text: `${name(b)} stands in the ${ORD[r]} from the ${ORD[h]} — a trine support to ${meaning}`, side: 'a', weight: 1.7, ground: 'Phaladīpikā 15.2, benefics in trines from the examined house' });
    } else if ([4, 7, 10].includes(r)) {
      out.push({ text: `${name(b)} stands in the ${ORD[r]} from the ${ORD[h]} — a kendra support to ${meaning}`, side: 'a', weight: 1.3, ground: 'Phaladīpikā 15.2, benefics in kendras from the examined house' });
    }
  }
  for (const m of MAL) {
    const r = rel(chart.planets[m].house, h);
    if (r === 1) continue;
    if (DUS.includes(r)) {
      out.push({ text: `${name(m)} stands in the ${ORD[r]} from the ${ORD[h]} — this damages ${meaning}`, side: 'b', weight: 1.7, ground: 'Phaladīpikā 15.4, malefics in the 6th, 8th or 12th from the examined house' });
    }
  }

  // ---- PH15.20–25: judge the bhāva, its lord and its kāraka together. ----
  const kar = KARAKA[h];
  if (kar && kar !== lord) {
    const kp = chart.planets[kar];
    if (kp) {
      const kd = kp.dignity;
      if (kd === 'Exalted (Ucca)' || kd === 'Own Sign (Swakshetra)' || kd === 'Moolatrikona') {
        out.push({ text: `the kāraka of the ${ORD[h]}, ${name(kar)}, is ${kd} in the ${ORD[kp.house]} — the natural significator of ${meaning} is itself strong`, side: 'a', weight: 1.9, ground: 'Phaladīpikā 15.20–25, bhāva, bhāveśa and kāraka judged together' });
      } else if (kd === 'Debilitated (Neecha)' || kd.startsWith('Enemy')) {
        out.push({ text: `the kāraka of the ${ORD[h]}, ${name(kar)}, is ${kd} — the natural significator of ${meaning} is itself weak`, side: 'b', weight: 1.9, ground: 'Phaladīpikā 15.20–25' });
      }
      if (DUS.includes(kp.house)) {
        out.push({ text: `the kāraka of the ${ORD[h]}, ${name(kar)}, sits in the ${ORD[kp.house]}, a duḥsthāna — ${meaning} is pulled towards loss`, side: 'b', weight: 1.3, ground: 'Phaladīpikā 15.20–25' });
      } else if (KENDRA.includes(kp.house)) {
        out.push({ text: `the kāraka of the ${ORD[h]}, ${name(kar)}, stands in the ${ORD[kp.house]}, a kendra — ${meaning} has a visible footing`, side: 'a', weight: 1.1, ground: 'Phaladīpikā 15.20–25' });
      }
    }
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

  const o2 = OUTCOME[h];
  for (const f of out) f.predicts = f.predicts || (o2 ? (f.side === 'a' ? o2.good : o2.bad) : '');
  return applyCompoundGate(out, chart, h);
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
  const beneficWith = occ.some((o) => BEN.includes(o));
  const beneficAspect = BEN.some((b) => (chart.planets[b].aspectsToHouses ?? []).includes(h));

  const kar = KARAKA[h];
  const kp = kar ? chart.planets[kar] : undefined;
  const weakKaraka = !!kp && (kp.dignity === 'Debilitated (Neecha)' || kp.dignity.startsWith('Enemy') || DUS.includes(kp.house));
  const maleficWith = occ.some((o) => MAL.includes(o));
  const maleficAspect = MAL.some((m) => (chart.planets[m].aspectsToHouses ?? []).includes(h));
  const enclosure = maleficWith && maleficAspect;
  const weakLord = afflictions >= 2;
  const compoundCount = [weakLord, weakKaraka, enclosure].filter(Boolean).length;

  return out.map((f) => {
    if (f.side !== 'b' || f.weight < 2) return f;
    const severeOk = afflictions >= 2 && compoundCount >= 2 && !(beneficWith || beneficAspect);
    if (severeOk) return { ...f, compound: 'satisfied' as const };
    return {
      ...f,
      weight: Math.min(f.weight, 1.2),
      compound: 'single-condition' as const,
      text: `${f.text} — but this is a single condition, and Phaladīpikā 15.3 and 15.6 require the full configuration before a severe reading is declared, so it is weighed as a caution rather than a result`,
    };
  });
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
