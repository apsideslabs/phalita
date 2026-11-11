/**
 * PHALITA — the verse rules.
 *
 * Each is a specific verse of Phaladīpikā with a condition it states, tested
 * against the chart. They run after the general findings and either adjust one
 * or add their own, always carrying the verse that produced them.
 *
 * Fourteen of the thirty-three audited rules are here. The remainder need chart
 * data this engine does not expose yet — bhāva cusp degrees (15.14), drekkāṇa
 * lords (15.7), upacaya classes (15.18), mūlatrikoṇa positions (15.11) — and are
 * left unimplemented rather than approximated.
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
const ENEMY: Record<string, string[]> = {
  sun: ['venus', 'saturn'],
  moon: [],
  mars: ['mercury'],
  mercury: ['moon'],
  jupiter: ['venus', 'mercury'],
  venus: ['sun', 'moon'],
  saturn: ['sun', 'moon', 'mars'],
};
const SEVEN: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const DUST = [6, 8, 12];

const lordOf = (c: JyotishaChart, h: number) =>
  c.bhavas[h - 1]?.rashiLord as PlanetId | undefined;

const SIGN_TABLE = RASHIS as unknown as Record<number, { sanskritName?: string }>;
const signName = (c: JyotishaChart, h: number): string => {
  const n = c.bhavas[h - 1]?.rashiNumber;
  return (n && SIGN_TABLE[n]?.sanskritName) || 'that sign';
};

const bal = (c: JyotishaChart, p: PlanetId | undefined): number => {
  if (!p) return 0;
  const sb = c.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  return sb[p]?.totalVirupas ?? 0;
};

const meanBala = (c: JyotishaChart): number => {
  const vals = SEVEN.map((p) => bal(c, p)).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

const rel = (other: number, h: number) => ((other - h + 12) % 12) + 1;
const dignified = (c: JyotishaChart, p: PlanetId | undefined): boolean => {
  if (!p) return false;
  const d = String(c.planets[p]?.dignity ?? '');
  return /Exalted|Moolatrikona|Own Sign|Great Friend/.test(d);
};

const housesRuledBy = (c: JyotishaChart, p: PlanetId): number[] => {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) if (c.bhavas[h - 1]?.rashiLord === p) out.push(h);
  return out;
};

export function applyVerseRules(
  chart: JyotishaChart,
  bhava: number,
  findings: Finding[]
): Finding[] {
  let out = findings.slice();
  const mean = meanBala(chart);
  const lord = lordOf(chart, bhava);
  const lordHouse = lord ? (chart.planets[lord]?.house ?? 0) : 0;
  const occupants = ((chart.bhavas[bhava - 1]?.planetsInHouse ?? []) as PlanetId[]);
  const lagnaLord = lordOf(chart, 1);
  const lagnaHouse = lagnaLord ? (chart.planets[lagnaLord]?.house ?? 0) : 0;

  // ---- 15.9 — strength modifies the defect -------------------------------
  if (lord && mean > 0) {
    const lb = bal(chart, lord);
    out = out.map((f) => {
      if (f.side !== 'b') return f;
      if (!/duḥsthāna|fallen|inimical/i.test(f.text)) return f;
      if (lb > mean * 1.15) {
        return { ...f, weight: f.weight * 0.5,
          text: `${f.text} — though the lord carries ${Math.round(lb)} virūpas, so 15.9 holds the defect small`,
          ground: `${f.ground}; Phaladīpikā 15.9` };
      }
      if (lb < mean * 0.85) {
        return { ...f, weight: f.weight * 1.25,
          text: `${f.text} — and the lord is weak at ${Math.round(lb)} virūpas, which 15.9 says multiplies the fault`,
          ground: `${f.ground}; Phaladīpikā 15.9` };
      }
      return f;
    });
  }

  // ---- 15.10 — the Lagna lord promotes the house it occupies -------------
  if (lagnaLord && lagnaHouse === bhava && lagnaLord !== lord) {
    out.push({ side: 'a', weight: 1.6,
      text: `The lord of the lagna, ${lagnaLord}, sits in this very house — 15.10 holds that the lagna lord promotes the house it occupies, whatever its nature would otherwise say`,
      ground: 'Phaladīpikā 15.10' });
  }

  // ---- 15.5 — a lord fallen away from its own house ----------------------
  if (lord && lordHouse && DUST.includes(rel(lordHouse, bhava))) {
    out.push({ side: 'b', weight: 1.7,
      text: `The lord ${lord} stands in the ${ord(rel(lordHouse, bhava))} from its own house — 15.5 treats a lord fallen into the 6th, 8th or 12th from its seat as one that cannot protect it`,
      ground: 'Phaladīpikā 15.5' });
  }

  // ---- 15.12 — a great enemy of the lord, sitting in the house -----------
  if (lord) {
    const foes = ENEMY[lord] ?? [];
    const foe = occupants.find((p) => foes.includes(p));
    if (foe) {
      out.push({ side: 'b', weight: 1.5,
        text: `${foe} sits in this house and is a natural enemy of its lord ${lord} — 15.12 counts enmity between the occupant and the lord, not the occupant's own dignity`,
        ground: 'Phaladīpikā 15.12' });
    }
  }

  // ---- 15.27 — lagna lord joined to a house lord -------------------------
  if (lagnaLord && lord && lagnaLord !== lord && lagnaHouse && lagnaHouse === lordHouse) {
    out.push({ side: 'a', weight: 1.5,
      text: `The lagna lord ${lagnaLord} and this house's lord ${lord} are together in the ${ord(lagnaHouse)} — 15.27 reads the joined lords as giving this house's effects through the native's own person`,
      ground: 'Phaladīpikā 15.27' });
  }

  // ---- 15.29 — a dusthana lord in its other own sign ---------------------
  if (lord && lordHouse) {
    const ruled = housesRuledBy(chart, lord);
    const dustHouse = ruled.find((h) => DUST.includes(h));
    const goodHouse = ruled.find((h) => h !== dustHouse);
    const signNow = chart.bhavas[lordHouse - 1]?.rashiNumber ?? 0;
    if (dustHouse && goodHouse && (OWN[lord] ?? []).includes(signNow) && lordHouse === goodHouse) {
      out.push({ side: 'a', weight: 1.5,
        text: `${lord} rules both the ${ord(dustHouse)} and the ${ord(goodHouse)}, and stands in the ${ord(goodHouse)} in its own sign — 15.29 gives the result of the own-sign house, not of the dusthāna`,
        ground: 'Phaladīpikā 15.29' });
    }
  }

  // ---- 12.1 — what supports children ------------------------------------
  if (bhava === 5) {
    const jup = dignified(chart, 'jupiter');
    const moon = dignified(chart, 'moon');
    const lagnaOk = dignified(chart, lagnaLord);
    const lordOk = dignified(chart, lord);
    const count = [jup, moon, lagnaOk, lordOk].filter(Boolean).length;
    if (count >= 3) {
      out.push({ side: 'a', weight: 2.0,
        text: `${count} of the four significators 12.1 names are well placed — Jupiter, the Moon, the lagna lord and the fifth lord — which the verse reads as children supported`,
        ground: 'Phaladīpikā 12.1',
        predicts: 'Children come without the chart having to be argued with' });
    }
  }

  // ---- 12.3 — a malefic in its own sign in the fifth is not a denial ------
  if (bhava === 5) {
    const fifth = chart.bhavas[4];
    const ownMalefic = occupants.find(
      (p) => MAL.includes(p) && (OWN[p] ?? []).includes(fifth?.rashiNumber ?? 0)
    );
    if (ownMalefic) {
      out = out.filter((f) => !(f.side === 'b' && /occupies the 5th/i.test(f.text)));
      out.push({ side: 'a', weight: 2.2,
        text: `${ownMalefic} sits in the fifth in its own sign — 12.3 reads that as progeny rather than denial, whatever the general rule says about malefics in a house`,
        ground: 'Phaladīpikā 12.3',
        predicts: 'Children come, though the chart makes them a matter of effort rather than ease' });
    }
  }

  // ---- 14.1 — disease needs agreement -----------------------------------
  if (bhava === 1 || bhava === 6) {
    const afflicted = MAL.filter((p) => {
      const h = chart.planets[p]?.house ?? 0;
      return h && DUST.includes(h);
    }).length;
    const lordInDust = lordHouse && DUST.includes(lordHouse);
    const score = afflicted + (lordInDust ? 1 : 0);
    if (score >= 2) {
      out.push({ side: 'b', weight: 1.8,
        text: `${afflicted} malefics sit in the 6th, 8th or 12th${lordInDust ? ', and the sixth lord is among them' : ''} — 14.1 asks for two or three of these to agree before disease is named, and they do`,
        ground: 'Phaladīpikā 14.1' });
    }
  }

  // ---- 15.19 — malefics in 6/8/12 from a house increase it through defect -
  const dust = MAL.filter((p) => {
    const h = chart.planets[p]?.house;
    return h && DUST.includes(rel(h, bhava));
  });
  if (dust.length >= 2) {
    out.push({ side: 'b', weight: 1.2,
      text: `${dust.length} malefics stand in the 6th, 8th or 12th from this house. 15.19 says that increases the house through defects, while 15.4 says it damages it — the text argues with itself here, and both readings are kept`,
      ground: 'Phaladīpikā 15.19 against 15.4 (disputed)' });
  }

  // ---- 10.1 — the seventh is judged from the Moon as well as the Lagna ----
  if (bhava === 7) {
    const moonHouse = chart.planets.moon?.house ?? 0;
    if (moonHouse) {
      const seventhFromMoon = ((moonHouse - 1 + 6) % 12) + 1;
      const lordFromMoon = chart.bhavas[seventhFromMoon - 1]?.rashiLord as PlanetId | undefined;
      const good = lordFromMoon && BEN.includes(lordFromMoon);
      out.push({ side: good ? 'a' : 'b', weight: 1.4,
        text: good
          ? `Counted from the Moon, the seventh falls in ${signName(chart, seventhFromMoon)} and its lord ${lordFromMoon} is a benefic — 10.1 reads the Moon's seventh alongside the Lagna's, and this one is kind`
          : `Counted from the Moon, the seventh falls in ${signName(chart, seventhFromMoon)} with ${lordFromMoon} ruling it — 10.1 requires both the Lagna's seventh and the Moon's, and this one is not favourable`,
        ground: 'Phaladīpikā 10.1' });
    }
  }

  // ---- 5.1 — livelihood from the stronger of Lagna and Moon -------------
  if (bhava === 10) {
    const lagnaLordB = bal(chart, lagnaLord);
    const moonB = bal(chart, 'moon');
    const useLagna = lagnaLordB >= moonB;
    out.push({ side: 'a', weight: 1.3,
      text: `5.1 reads livelihood from the stronger of the Lagna and the Moon; here the ${useLagna ? 'Lagna' : 'Moon'} is stronger (${Math.round(useLagna ? lagnaLordB : moonB)} against ${Math.round(useLagna ? moonB : lagnaLordB)} virūpas), so the tenth is judged from the ${useLagna ? 'lagna' : 'Moon'} in this chart`,
      ground: 'Phaladīpikā 5.1' });
  }

  return out;
}

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
