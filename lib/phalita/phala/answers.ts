/**
 * PHALITA — the two questions that are answered by weighing, not by a verse.
 *
 * "Employment or your own enterprise?" and "love match or arranged?" are not in
 * any verse. A working astrologer answers them by reading several placements
 * together and committing. That judgement is the astrologer's, so every factor
 * is published with its weight and its ground.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import type { QFactor } from './questions';

export interface WeighedAnswer {
  id: string;
  question: string;
  answer: string;
  a: string;
  b: string;
  aScore: number;
  bScore: number;
  confidence: 'clear' | 'leaning' | 'mixed';
  factors: QFactor[];
  caveat: string;
}

const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

const dignityScore = (d: string) =>
  d === 'Exalted (Ucca)' ? 3
  : d === 'Moolatrikona' ? 2.5
  : d === 'Own Sign (Swakshetra)' ? 2
  : d.startsWith('Great Friend') ? 1.2
  : d.startsWith('Friend') ? 1
  : d === 'Neutral (Sama)' ? 0
  : d.startsWith('Enemy') ? -1
  : d.startsWith('Great Enemy') ? -1.5
  : -2.5;

const noDot = (s: string) => s.replace(/\.+$/, '');

function compose(
  aScore: number,
  bScore: number,
  a: string,
  b: string,
  factors: QFactor[]
): { answer: string; confidence: 'clear' | 'leaning' | 'mixed' } {
  const margin = Math.abs(aScore - bScore);
  const winning = aScore >= bScore ? 'a' : 'b';
  const lead = aScore >= bScore ? a : b;
  const win = factors.filter((f) => f.side === winning).slice(0, 2).map((f) => noDot(f.label));
  const lose = factors.filter((f) => f.side !== winning).slice(0, 1).map((f) => noDot(f.label));
  const because = win.length ? ` ${win.join('; ')}.` : '';
  const against = lose.length ? ` Against it: ${lose[0]}.` : '';
  if (margin < 2) {
    return {
      answer: `Close to even — ${a.toLowerCase()} and ${b.toLowerCase()} are almost balanced here.${because}${against} The chart does not settle it.`,
      confidence: 'mixed',
    };
  }
  if (margin < 5) return { answer: `${lead}.${because}${against}`, confidence: 'leaning' };
  return { answer: `${lead}, and clearly so.${because}${against}`, confidence: 'clear' };
}

/** Employment or enterprise. */
export function careerMode(chart: JyotishaChart): WeighedAnswer {
  const factors: QFactor[] = [];
  const lord10 = chart.bhavas[9]?.rashiLord as PlanetId | undefined;
  const p10 = lord10 ? chart.planets[lord10] : undefined;
  const lord7 = chart.bhavas[6]?.rashiLord as PlanetId | undefined;
  const p7 = lord7 ? chart.planets[lord7] : undefined;
  const lord2 = chart.bhavas[1]?.rashiLord as PlanetId | undefined;
  const p2 = lord2 ? chart.planets[lord2] : undefined;

  let service = 0;
  let enterprise = 0;

  if (lord10) {
    const natural: Partial<Record<PlanetId, [number, number, string]>> = {
      saturn: [3, 0, 'Saturn rules the tenth — labour, service, patience over years'],
      mercury: [0, 3, 'Mercury rules the tenth — trade, negotiation, movement of goods and money'],
      sun: [2.5, 0.5, 'the Sun rules the tenth — office, authority, working inside a structure'],
      mars: [0.5, 2.5, 'Mars rules the tenth — force, competition, engineering, working where you push'],
      jupiter: [1.5, 1, 'Jupiter rules the tenth — teaching, counsel, advisory work'],
      venus: [0.5, 2.5, 'Venus rules the tenth — arts, luxury, deal-making, the market'],
      moon: [1.5, 1, 'the Moon rules the tenth — public-facing work, care, fluctuation'],
    };
    const n = natural[lord10];
    if (n) {
      service += n[0];
      enterprise += n[1];
      factors.push({
        label: n[2],
        side: n[0] >= n[1] ? 'a' : 'b',
        weight: Math.max(n[0], n[1]),
        ground: 'BPHS ch. 24, the natural significations of the grahas',
      });
    }
  }

  if (p10) {
    if (p10.house === 7 || p10.house === 10) {
      enterprise += 2;
      factors.push({ label: `tenth lord in house ${p10.house} — partnership or public independent standing`, side: 'b', weight: 2, ground: 'Phaladīpikā 16.27, the tenth lord in a kendra or a koṇa' });
    } else if (p10.house === 6) {
      service += 2;
      factors.push({ label: 'tenth lord in the sixth — work done in service of others', side: 'a', weight: 2, ground: 'Phaladīpikā 16.19' });
    }
    const d = dignityScore(p10.dignity);
    if (d > 0) {
      enterprise += d;
      factors.push({ label: `tenth lord ${p10.dignity} — able to stand on its own`, side: 'b', weight: d, ground: 'Phaladīpikā 16.27' });
    } else if (d < 0) {
      service += Math.abs(d);
      factors.push({ label: `tenth lord ${p10.dignity} — works better within a structure than alone`, side: 'a', weight: Math.abs(d), ground: 'Phaladīpikā 16.27' });
    }
  }

  const occ10 = (chart.bhavas[9]?.planetsInHouse ?? []) as PlanetId[];
  if (occ10.includes('saturn')) {
    service += 2.5;
    factors.push({ label: 'Saturn in the tenth — long service, salaried work, slow and secure rise', side: 'a', weight: 2.5, ground: 'Phaladīpikā 19.13' });
  }
  if (occ10.includes('mercury') || occ10.includes('venus')) {
    enterprise += 2;
    factors.push({ label: `${occ10.includes('mercury') ? 'Mercury' : 'Venus'} in the tenth — commerce and deal-making`, side: 'b', weight: 2, ground: 'Phaladīpikā 19.10' });
  }

  if (p7 && dignityScore(p7.dignity) > 0) {
    enterprise += 1.5;
    factors.push({ label: 'seventh lord well placed — able to work with partners', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.20' });
  }

  if (p2 && dignityScore(p2.dignity) > 0) {
    enterprise += 1.5;
    factors.push({ label: 'lord of wealth strong — capital of your own to risk', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.5' });
  } else if (p2 && dignityScore(p2.dignity) < 0) {
    service += 1;
    factors.push({ label: 'lord of wealth weak — little capital of your own to risk', side: 'a', weight: 1, ground: 'Phaladīpikā 16.5' });
  }

  const v = compose(service, enterprise, 'Employment', 'Enterprise', factors);
  return {
    id: 'career-mode',
    question: 'Employment or your own enterprise?',
    answer: v.answer,
    a: 'Employment',
    b: 'Enterprise',
    aScore: service,
    bScore: enterprise,
    confidence: v.confidence,
    factors,
    caveat: 'No verse says “you will do a job”. The judgement is built from the significations the texts assign to the grahas, and the weights are published so you can disagree with them.',
  };
}

/** Love match or arranged. */
export function marriageMode(chart: JyotishaChart): WeighedAnswer {
  const factors: QFactor[] = [];
  const lord7 = chart.bhavas[6]?.rashiLord as PlanetId | undefined;
  const p7 = lord7 ? chart.planets[lord7] : undefined;
  const lord5 = chart.bhavas[4]?.rashiLord as PlanetId | undefined;
  const p5 = lord5 ? chart.planets[lord5] : undefined;
  const occ7 = (chart.bhavas[6]?.planetsInHouse ?? []) as PlanetId[];
  const occ5 = (chart.bhavas[4]?.planetsInHouse ?? []) as PlanetId[];

  let love = 0;
  let arranged = 0;

  if (chart.planets.venus.house === chart.planets.moon.house) {
    love += 2.5;
    factors.push({ label: 'Venus and the Moon in one house — attraction leads the choice', side: 'a', weight: 2.5, ground: 'Phaladīpikā 9.7; Venus as kāraka of marriage' });
  }
  if (occ7.includes('venus')) {
    love += 3;
    factors.push({ label: 'Venus in the seventh — the partner is chosen for love', side: 'a', weight: 3, ground: 'Phaladīpikā 10.7' });
  }
  if (occ7.includes('rahu')) {
    love += 2;
    factors.push({ label: 'Rāhu in the seventh — a match outside the family’s expectation', side: 'a', weight: 2, ground: 'Phaladīpikā 19.15' });
  }
  if (p7 && (p7.house === 5 || p7.house === 11)) {
    love += 2;
    factors.push({ label: `seventh lord in house ${p7.house} — the partner comes from your own circle`, side: 'a', weight: 2, ground: 'Phaladīpikā 16.20' });
  }
  if (p5 && p5.house === 7) {
    love += 1.5;
    factors.push({ label: 'fifth lord in the seventh — romance turns into marriage', side: 'a', weight: 1.5, ground: 'Phaladīpikā 16.15' });
  }
  if (occ5.includes('venus') || occ5.includes('moon')) {
    love += 1.5;
    factors.push({ label: 'Venus or the Moon in the fifth — a romantic temperament', side: 'a', weight: 1.5, ground: 'Phaladīpikā 9.7' });
  }

  if ((chart.planets.jupiter.aspectsToHouses ?? []).includes(7)) {
    arranged += 2.5;
    factors.push({ label: 'Jupiter aspects the seventh — a match approved and arranged by elders', side: 'b', weight: 2.5, ground: 'Phaladīpikā 10.7' });
  }
  if (p7 && dignityScore(p7.dignity) >= 2) {
    arranged += 1.5;
    factors.push({ label: 'seventh lord in its own or exalted sign — a settled, conventional match', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.20' });
  }
  if (occ7.some((o) => MALEFICS.includes(o)) && !occ7.includes('rahu')) {
    arranged += 1;
    factors.push({ label: 'a malefic in the seventh — the match is constrained rather than chosen', side: 'b', weight: 1, ground: 'Phaladīpikā 10.15' });
  }

  const v = compose(love, arranged, 'A love match', 'An arranged match', factors);
  return {
    id: 'marriage-mode',
    question: 'Love match or arranged?',
    answer: v.answer,
    a: 'Love match',
    b: 'Arranged',
    aScore: love,
    bScore: arranged,
    confidence: v.confidence,
    factors,
    caveat: 'The texts describe the seventh house and Venus; they do not use the words “love marriage”. The weights are published above.',
  };
}
