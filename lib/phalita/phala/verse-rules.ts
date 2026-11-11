/**
 * PHALITA — the verse rules.
 *
 * The rules in rules.ts judge a bhāva from its lord, occupants and aspects.
 * These are different: each is a specific verse of Phaladīpikā with a condition
 * it states, and each changes the reading in a way the general rules cannot.
 *
 * They are applied after the general findings, and they either adjust one or add
 * a finding of their own — always with the verse that produced it.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { RASHIS } from '@/lib/jyotisha/constants';
import type { Finding } from './rules';

const MAL: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const BEN: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const OWN: Record<string, number[]> = {
  sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6],
  jupiter: [9, 12], venus: [2, 7], saturn: [10, 11],
};

const lordOf = (c: JyotishaChart, h: number) =>
  c.bhavas[h - 1]?.rashiLord as PlanetId | undefined;

const signName = (c: JyotishaChart, h: number): string => {
  const n = c.bhavas[h - 1]?.rashiNumber;
  return (n && RASHIS[n - 1]?.sanskritName) || 'that sign';
};

const bal = (c: JyotishaChart, p: PlanetId | undefined): number => {
  if (!p) return 0;
  const sb = c.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  return sb[p]?.totalVirupas ?? 0;
};

const meanBala = (c: JyotishaChart): number => {
  const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vals = seven.map((p) => bal(c, p)).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

/** Relative house of `other` counted from `h`. */
const rel = (other: number, h: number) => ((other - h + 12) % 12) + 1;

export function applyVerseRules(
  chart: JyotishaChart,
  bhava: number,
  findings: Finding[]
): Finding[] {
  let out = findings.slice();
  const mean = meanBala(chart);
  const lord = lordOf(chart, bhava);

  // ---- 15.9 — strength modifies the defect -------------------------------
  if (lord && mean > 0) {
    const lb = bal(chart, lord);
    const strong = lb > mean * 1.15;
    const weak = lb < mean * 0.85;

    out = out.map((f) => {
      if (f.side !== 'b') return f;
      if (!/duḥsthāna|fallen|inimical/i.test(f.text)) return f;
      if (strong) {
        return {
          ...f,
          weight: f.weight * 0.5,
          text: `${f.text} — though the lord carries ${Math.round(lb)} virūpas, so 15.9 holds the defect small`,
          ground: `${f.ground}; Phaladīpikā 15.9`,
        };
      }
      if (weak) {
        return {
          ...f,
          weight: f.weight * 1.25,
          text: `${f.text} — and the lord is weak at ${Math.round(lb)} virūpas, which 15.9 says multiplies the fault`,
          ground: `${f.ground}; Phaladīpikā 15.9`,
        };
      }
      return f;
    });
  }

  // ---- 12.3 — a malefic in its own sign in the fifth is not a denial ------
  if (bhava === 5) {
    const fifth = chart.bhavas[4];
    const occupants = (fifth?.planetsInHouse ?? []) as PlanetId[];
    const ownMalefic = occupants.find(
      (p) => MAL.includes(p) && (OWN[p] ?? []).includes(fifth?.rashiNumber ?? 0)
    );
    if (ownMalefic) {
      out = out.filter((f) => !(f.side === 'b' && /occupies the 5th/i.test(f.text)));
      out.push({
        side: 'a',
        weight: 2.2,
        text: `${ownMalefic} sits in the fifth in its own sign — 12.3 reads that as progeny rather than denial, whatever the general rule says about malefics in a house`,
        ground: 'Phaladīpikā 12.3',
        predicts: 'Children come, though the chart makes them a matter of effort rather than ease',
      });
    }
  }

  // ---- 15.19 — malefics in 6/8/12 from a house increase it through defect -
  const dust = MAL.filter((p) => {
    const h = chart.planets[p]?.house;
    return h && [6, 8, 12].includes(rel(h, bhava));
  });
  if (dust.length >= 2) {
    out.push({
      side: 'b',
      weight: 1.2,
      text: `${dust.length} malefics stand in the 6th, 8th or 12th from this house. 15.19 says that increases the house through defects, while 15.4 says it damages it — the text argues with itself here, and both readings are kept`,
      ground: 'Phaladīpikā 15.19 against 15.4 (disputed)',
    });
  }

  // ---- 10.1 — the seventh is judged from the Moon as well as the Lagna ----
  if (bhava === 7) {
    const moonHouse = chart.planets.moon?.house ?? 0;
    if (moonHouse) {
      const seventhFromMoon = ((moonHouse - 1 + 6) % 12) + 1;
      const lordFromMoon = chart.bhavas[seventhFromMoon - 1]?.rashiLord as PlanetId | undefined;
      const good = lordFromMoon && BEN.includes(lordFromMoon);
      out.push({
        side: good ? 'a' : 'b',
        weight: 1.4,
        text: good
          ? `Counted from the Moon, the seventh falls in ${signName(chart, seventhFromMoon)} and its lord ${lordFromMoon} is a benefic — 10.1 reads the Moon's seventh alongside the Lagna's, and this one is kind`
          : `Counted from the Moon, the seventh falls in ${signName(chart, seventhFromMoon)} with ${lordFromMoon} ruling it — 10.1 requires both the Lagna's seventh and the Moon's, and this one is not favourable`,
        ground: 'Phaladīpikā 10.1',
      });
    }
  }

  return out;
}
