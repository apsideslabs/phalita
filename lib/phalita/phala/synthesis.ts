/**
 * PHALITA — synthesis: the questions a person actually asks.
 *
 * "Will I do a job or run my own business?" and "Is my marriage a love match or
 * an arranged one?" are not answered by any single verse. A working astrologer
 * answers them by reading several placements together and committing to a
 * judgement.
 *
 * That judgement is the astrologer's, not the text's. So this module is
 * labelled as PHALITA's synthesis, every factor it uses is shown with its
 * weight, and the classical ground for each factor is named. No verse is
 * quoted as if it said "you will run a business" — none does.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { buildQuestions } from './questions';
import { buildQuestions2 } from './questions2';

export interface SynthesisFactor {
  label: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
}

export interface Synthesis {
  id: string;
  question: string;
  answer: string;
  a: string;
  b: string;
  aScore: number;
  bScore: number;
  confidence: 'clear' | 'leaning' | 'mixed';
  factors: SynthesisFactor[];
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

function verdict(
  aScore: number,
  bScore: number,
  a: string,
  b: string
): { answer: string; confidence: 'clear' | 'leaning' | 'mixed' } {
  const margin = Math.abs(aScore - bScore);
  const lead = aScore >= bScore ? a : b;
  if (margin < 2) {
    return {
      answer: `Mixed. The chart does not settle this — it reads almost evenly between ${a} and ${b}, and the choice is likely to be made by circumstance rather than by nature.`,
      confidence: 'mixed',
    };
  }
  if (margin < 5) {
    return {
      answer: `It leans towards ${lead}. The indications are not one-sided, but the balance sits there.`,
      confidence: 'leaning',
    };
  }
  return { answer: `${lead} — and clearly so.`, confidence: 'clear' };
}

/** Employment or enterprise. */
export function careerMode(chart: JyotishaChart): Synthesis {
  const factors: SynthesisFactor[] = [];
  const lord10 = chart.bhavas[9]?.rashiLord as PlanetId | undefined;
  const p10 = lord10 ? chart.planets[lord10] : undefined;
  const lord7 = chart.bhavas[6]?.rashiLord as PlanetId | undefined;
  const p7 = lord7 ? chart.planets[lord7] : undefined;
  const lord2 = chart.bhavas[1]?.rashiLord as PlanetId | undefined;
  const p2 = lord2 ? chart.planets[lord2] : undefined;

  let service = 0;
  let enterprise = 0;

  // The nature of the tenth lord. Saturn governs labour and service, Mercury
  // trade, the Sun office and authority, Mars force and competition.
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

  // The tenth lord's placement: the seventh and tenth give partnership and
  // independent standing; the sixth gives service under others.
  if (p10) {
    if (p10.house === 7 || p10.house === 10) {
      enterprise += 2;
      factors.push({
        label: `tenth lord in house ${p10.house} — partnership or public independent standing`,
        side: 'b',
        weight: 2,
        ground: 'Phaladīpikā 16.27, the tenth lord in a kendra or a koṇa',
      });
    } else if (p10.house === 6) {
      service += 2;
      factors.push({
        label: 'tenth lord in the sixth — work done in service of others',
        side: 'a',
        weight: 2,
        ground: 'Phaladīpikā 16.19, a bhāveśa in the sixth turns its matter towards service and conflict',
      });
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

  // Saturn or the Sun sitting in the tenth: employment and office.
  const occ10 = (chart.bhavas[9]?.planetsInHouse ?? []) as PlanetId[];
  if (occ10.includes('saturn')) {
    service += 2.5;
    factors.push({ label: 'Saturn in the tenth — long service, salaried work, slow and secure rise', side: 'a', weight: 2.5, ground: 'Phaladīpikā 19.13, the Saturn daśā of labour and endurance' });
  }
  if (occ10.includes('mercury') || occ10.includes('venus')) {
    enterprise += 2;
    factors.push({ label: `${occ10.includes('mercury') ? 'Mercury' : 'Venus'} in the tenth — commerce and deal-making`, side: 'b', weight: 2, ground: 'Phaladīpikā 19.10, the Mercury daśā of trade and speech' });
  }

  // The seventh house carries partnership; a strong seventh supports business.
  if (p7 && dignityScore(p7.dignity) > 0) {
    enterprise += 1.5;
    factors.push({ label: 'seventh lord well placed — able to work with partners', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.20' });
  }

  // Capital: the second house funds an enterprise.
  if (p2 && dignityScore(p2.dignity) > 0) {
    enterprise += 1.5;
    factors.push({ label: 'lord of wealth strong — capital of your own to risk', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.5' });
  } else if (p2 && dignityScore(p2.dignity) < 0) {
    service += 1;
    factors.push({ label: 'lord of wealth weak — little capital of your own to risk', side: 'a', weight: 1, ground: 'Phaladīpikā 16.5' });
  }

  const v = verdict(service, enterprise, 'Employment', 'Enterprise');
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
    caveat:
      'This is PHALITA’s synthesis, not a quotation. No verse says “you will do a job” — the judgement is built from the significations the texts assign to the grahas and the placements they describe, and the weights are published above so you can disagree with them.',
  };
}

/** Love match or arranged. */
export function marriageMode(chart: JyotishaChart): Synthesis {
  const factors: SynthesisFactor[] = [];
  const lord7 = chart.bhavas[6]?.rashiLord as PlanetId | undefined;
  const p7 = lord7 ? chart.planets[lord7] : undefined;
  const lord5 = chart.bhavas[4]?.rashiLord as PlanetId | undefined;
  const p5 = lord5 ? chart.planets[lord5] : undefined;
  const occ7 = (chart.bhavas[6]?.planetsInHouse ?? []) as PlanetId[];
  const occ5 = (chart.bhavas[4]?.planetsInHouse ?? []) as PlanetId[];

  let love = 0;
  let arranged = 0;

  const venusMoon = chart.planets.venus.house === chart.planets.moon.house;
  if (venusMoon) {
    love += 2.5;
    factors.push({ label: 'Venus and the Moon in one house — attraction leads the choice', side: 'a', weight: 2.5, ground: 'Phaladīpikā 9.7; Venus as kāraka of marriage' });
  }

  if (occ7.includes('venus')) {
    love += 3;
    factors.push({ label: 'Venus in the seventh — the partner is chosen for love', side: 'a', weight: 3, ground: 'Phaladīpikā 10.7, benefic company on the seventh' });
  }
  if (occ7.includes('rahu')) {
    love += 2;
    factors.push({ label: 'Rāhu in the seventh — a match outside the family’s expectation', side: 'a', weight: 2, ground: 'Phaladīpikā 19.15, the Rāhu daśā of unconventional fortune' });
  }

  if (p7 && (p7.house === 5 || p7.house === 11)) {
    love += 2;
    factors.push({ label: `seventh lord in house ${p7.house} — the partner comes from your own circle`, side: 'a', weight: 2, ground: 'Phaladīpikā 16.20' });
  }
  if (p5 && p5.house === 7) {
    love += 1.5;
    factors.push({ label: 'fifth lord in the seventh — romance turns into marriage', side: 'a', weight: 1.5, ground: 'Phaladīpikā 16.15, the fifth house of affection' });
  }
  if (occ5.includes('venus') || occ5.includes('moon')) {
    love += 1.5;
    factors.push({ label: 'Venus or the Moon in the fifth — a romantic temperament', side: 'a', weight: 1.5, ground: 'Phaladīpikā 9.7' });
  }

  const jupAspects7 = (chart.planets.jupiter.aspectsToHouses ?? []).includes(7);
  if (jupAspects7) {
    arranged += 2.5;
    factors.push({ label: 'Jupiter aspects the seventh — a match approved and arranged by elders', side: 'b', weight: 2.5, ground: 'Phaladīpikā 10.7, benefic dṛṣṭi on the seventh' });
  }
  if (p7 && dignityScore(p7.dignity) >= 2) {
    arranged += 1.5;
    factors.push({ label: 'seventh lord in its own or exalted sign — a settled, conventional match', side: 'b', weight: 1.5, ground: 'Phaladīpikā 16.20' });
  }
  if (occ7.some((o) => MALEFICS.includes(o)) && !occ7.includes('rahu')) {
    arranged += 1;
    factors.push({ label: 'a malefic in the seventh — the match is constrained rather than chosen', side: 'b', weight: 1, ground: 'Phaladīpikā 10.15' });
  }

  const v = verdict(love, arranged, 'A love match', 'An arranged match');
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
    caveat:
      'This is PHALITA’s synthesis, not a quotation. The classical texts describe the seventh house and Venus; they do not use the words “love marriage”. The judgement is built from those significations and the weights are published above.',
  };
}

export function buildSynthesis(chart: JyotishaChart): Synthesis[] {
  // The two detailed readings first, then the wider catalogue of questions.
  return [careerMode(chart), marriageMode(chart), ...buildQuestions(chart), ...buildQuestions2(chart)];
}
