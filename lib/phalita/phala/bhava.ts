/**
 * PHALITA — bhāva phala, the twelve houses.
 *
 * Every rule here is a condition of Phaladīpikā 16 tested against the chart.
 * The order is the order of the houses: body, wealth, siblings, home, children,
 * health, spouse, longevity, fortune, career, gains.
 *
 * Each statement is written as the conclusion a person can act on. The
 * condition that produced it is carried in the citation and shown under the
 * line, so the working is available without being the answer.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { citationOf } from './engine';
import type { PhalaStatement } from './types';

export interface TestedRule {
  rule: string;
  when: string;
  fired: boolean;
}

const GOOD = ['Exalted (Ucca)', 'Moolatrikona', 'Own Sign (Swakshetra)', 'Great Friend (Adhi Mitra)', 'Friend (Mitra)'];
const STRONG = ['Exalted (Ucca)', 'Moolatrikona', 'Own Sign (Swakshetra)'];
const DUSTHANA = [6, 8, 12];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];

const HOUSE_NAME: Record<number, string> = {
  1: 'body and self',
  2: 'wealth and speech',
  3: 'siblings and courage',
  4: 'home, mother and property',
  5: 'children and intelligence',
  6: 'health and enemies',
  7: 'marriage',
  8: 'longevity and the hidden',
  9: 'fortune and father',
  10: 'career and standing',
  11: 'gains',
  12: 'loss and expenditure',
};

export interface BhavaResult {
  statements: PhalaStatement[];
  tested: TestedRule[];
}

export function evaluateBhavas(chart: JyotishaChart): BhavaResult {
  const statements: PhalaStatement[] = [];
  const tested: TestedRule[] = [];
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const str = (p?: PlanetId) => (p ? sb[p]?.totalVirupas ?? 0 : 0);
  const lord = (h: number) => chart.bhavas[h - 1]?.rashiLord as PlanetId | undefined;
  const pl = (p?: PlanetId) => (p ? chart.planets[p] : undefined);
  const occupants = (h: number) => (chart.bhavas[h - 1]?.planetsInHouse ?? []) as PlanetId[];

  const push = (fired: boolean, rule: string, when: string, st?: PhalaStatement) => {
    tested.push({ rule, when, fired });
    if (fired && st) statements.push(st);
  };

  const L1 = lord(1);
  const p1 = pl(L1);

  // 16.4 — the lagna lord well or ill placed
  if (p1) {
    push(
      GOOD.includes(p1.dignity) || p1.dignity === 'Debilitated (Neecha)',
      'Phaladīpikā 16.4',
      `lagna lord ${p1.name} in ${p1.dignity}, house ${p1.house}`,
      GOOD.includes(p1.dignity)
        ? {
            phala: `Your constitution is sound and your life grows steadily rather than by sudden turns. You recover from setbacks faster than most, and people read you as capable before you have said much.`,
            tone: 'shubha',
            keywords: [],
            citation: citationOf('phaladipika.16.4'),
          }
        : {
            phala: `Your vitality runs below your apparent strength, and you are likely to live and work at some distance from the station you were born into. Energy has to be managed rather than spent.`,
            tone: 'ashubha',
            keywords: [],
            citation: citationOf('phaladipika.16.4'),
          }
    );
  }

  // 16.5 — the second lord in the second house, and its company
  const L2 = lord(2);
  const p2 = pl(L2);
  if (p2) {
    const inSecond = p2.house === 2;
    const withSun = occupants(2).includes('sun');
    const withSaturn = occupants(2).includes('saturn');
    push(
      inSecond,
      'Phaladīpikā 16.5',
      `2nd lord ${p2.name} in house ${p2.house}; Sun in 2nd: ${withSun}; Saturn in 2nd: ${withSaturn}`,
      {
        phala: withSaturn
          ? 'Money stays tight and formal education is short — what you earn comes slowly and is held by discipline rather than by opportunity. You are likely to be self-taught in what actually pays you.'
          : withSun
          ? 'Money and learning arrive together: what you study turns into income, and your speech carries weight in negotiations.'
          : 'You keep what you earn. Family standing supports you, your word is taken seriously in money matters, and you tend to see a financial situation clearly before others do.',
        tone: withSaturn ? 'ashubha' : 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.5'),
      }
    );
  }

  // 16.8 — the third lord
  const L3 = lord(3);
  const p3 = pl(L3);
  if (p3) {
    const strong3 = STRONG.includes(p3.dignity) || GOOD.includes(p3.dignity);
    push(
      strong3 || DUSTHANA.includes(p3.house),
      'Phaladīpikā 16.8',
      `3rd lord ${p3.name} in ${p3.dignity}, house ${p3.house}`,
      {
        phala: strong3
          ? 'Siblings and peers multiply your strength — you are likely to rise with a network rather than alone, and courage comes easily to you.'
          : 'Siblings are a point of loss rather than support — distance, estrangement, or their absence. You build courage on your own rather than through a group.',
        tone: strong3 ? 'shubha' : 'ashubha',
        keywords: [],
        citation: citationOf('phaladipika.16.8'),
      }
    );
  }

  // 16.13 / 16.14 — the fourth house
  const L4 = lord(4);
  const p4 = pl(L4);
  const venus = chart.planets.venus;
  if (p4) {
    const bothGood = GOOD.includes(p4.dignity) && GOOD.includes(venus.dignity);
    const burnt = DUSTHANA.includes(p4.house) && occupants(4).some((o) => o === 'mars' || o === 'sun');
    push(
      bothGood,
      'Phaladīpikā 16.13',
      `4th lord ${p4.name} in ${p4.dignity}; Venus in ${venus.dignity}`,
      {
        phala: 'Property and comfort accumulate: a good house, vehicles, and the means to furnish a life well. You end up with a seat of some authority at home, and the family home becomes the base everything else is built on.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.13'),
      }
    );
    push(
      burnt,
      'Phaladīpikā 16.14',
      `4th lord ${p4.name} in house ${p4.house}; Mars or Sun in the 4th: ${occupants(4).filter((o) => o === 'mars' || o === 'sun').length > 0}`,
      {
        phala: 'The home is the weak point — property damaged, lost, or taken by others, and a childhood that was unsettled. Domestic peace has to be built deliberately rather than inherited.',
        tone: 'ashubha',
        keywords: [],
        citation: citationOf('phaladipika.16.14'),
      }
    );
  }

  // 16.15 — the fifth lord
  const L5 = lord(5);
  const p5 = pl(L5);
  if (p5) {
    const beneficCompany = occupants(5).some((o) => BENEFICS.includes(o)) || BENEFICS.includes(L5!);
    push(
      beneficCompany,
      'Phaladīpikā 16.15',
      `5th lord ${p5.name} in ${p5.dignity}; benefic company in the 5th: ${beneficCompany}`,
      {
        phala: 'Intelligence is your strongest asset and it is honest — you reason your way to conclusions and people trust what you say because you are not performing. Children and creative work come easily.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.15'),
      }
    );
  }

  // 16.17 / 16.18 — the sixth house, health and enemies
  const L6 = lord(6);
  const p6 = pl(L6);
  if (p1 && p6) {
    const lagnaStronger = str(L1) > str(L6);
    push(
      lagnaStronger,
      'Phaladipika 16.17',
      `lagna lord ${str(L1).toFixed(1)} vs 6th lord ${str(L6).toFixed(1)} virūpas`,
      {
        phala: 'Your body resists illness better than the average chart. Disease comes and goes without taking root, and recovery is quick.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.17'),
      }
    );
    push(
      DUSTHANA.includes(p6.house) && lagnaStronger,
      'Phaladīpikā 16.18',
      `6th lord ${p6.name} in house ${p6.house}; lagna lord stronger: ${lagnaStronger}`,
      {
        phala: 'Opposition does not last against you — rivals weaken on their own, and legal or professional adversaries tend to lose ground.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.18'),
      }
    );
  }

  // 16.19 — a bhāveśa in the sixth makes its bhāva hostile
  const hostile: string[] = [];
  for (let h = 1; h <= 12; h++) {
    const l = lord(h);
    if (l && chart.planets[l]?.house === 6 && h !== 6) hostile.push(`${h}`);
  }
  push(
    hostile.length > 0,
    'Phaladīpikā 16.19',
    `bhāveśas placed in the 6th: ${hostile.join(', ') || 'none'}`,
    hostile.length > 0
      ? {
          phala: `The area of ${hostile
            .map((h) => HOUSE_NAME[Number(h)])
            .join(', ')} works against you rather than for you. These are the parts of life where effort returns less than it should, and where problems arrive from the outside.`,
          tone: 'ashubha',
          keywords: [],
          citation: citationOf('phaladipika.16.19'),
        }
      : undefined
  );

  // 16.20 — the seventh lord strong
  const L7 = lord(7);
  const p7 = pl(L7);
  if (p7) {
    const good7 = GOOD.includes(p7.dignity) && BENEFICS.includes(L7!);
    push(
      good7,
      'Phaladīpikā 16.20',
      `7th lord ${p7.name} in ${p7.dignity}, benefic: ${BENEFICS.includes(L7!)}`,
      {
        phala: 'Marriage is a settled and supportive matter for you — a partner of good character, a household that holds, and children within it.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.20'),
      }
    );
  }

  // 16.21 — the eighth lord away from the kendras and weaker than the lagna lord
  const L8 = lord(8);
  const p8 = pl(L8);
  if (p8 && p1) {
    const notKendra = ![1, 4, 7, 10].includes(p8.house);
    const weaker = str(L8) < str(L1);
    push(
      notKendra && weaker,
      'Phaladīpikā 16.21',
      `8th lord ${p8.name} in house ${p8.house}; ${str(L8).toFixed(1)} vs lagna lord ${str(L1).toFixed(1)}`,
      {
        phala: 'Longevity is well supported and life runs without the chronic obstruction that shortens other charts. You are likely to outlast the difficulties that surround you.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.21'),
      }
    );
  }

  // 16.27 / 16.28 — the tenth house, career
  const L10 = lord(10);
  const p10 = pl(L10);
  if (p10) {
    const kendraKona = [1, 4, 5, 7, 9, 10].includes(p10.house);
    const dignified = STRONG.includes(p10.dignity);
    push(
      kendraKona && dignified,
      'Phaladīpikā 16.27',
      `10th lord ${p10.name} in house ${p10.house} (${p10.dignity})`,
      {
        phala: 'Career is where you are strongest. Standing, reputation and material fortune all come through work done publicly, and you are recognised for it in your own circle and beyond.',
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.27'),
      }
    );
    const sunOrMars = occupants(10).filter((o) => o === 'sun' || o === 'mars');
    push(
      sunOrMars.length > 0,
      'Phaladīpikā 16.28',
      `Sun or Mars in the 10th: ${sunOrMars.map((o) => GRAHA_PROPERTIES[o]?.name ?? o).join(', ') || 'none'}`,
      {
        phala: `Work is where your force shows: ${sunOrMars
          .map((o) => GRAHA_PROPERTIES[o]?.name ?? o)
          .join(' and ')} in the tenth gives you the capacity to drive large things through by will, and to gather people behind you.`,
        tone: 'shubha',
        keywords: [],
        citation: citationOf('phaladipika.16.28'),
      }
    );
  }

  // 16.29 — the eleventh lord joined to a bhāveśa
  const L11 = lord(11);
  const p11 = pl(L11);
  if (p11) {
    const joined = chart.bhavas
      .map((b, i) => ({ h: i + 1, l: b.rashiLord as PlanetId }))
      .filter((x) => x.h !== 11 && chart.planets[x.l]?.house === p11.house);
    push(
      joined.length > 0,
      'Phaladīpikā 16.29',
      `11th lord ${p11.name} in house ${p11.house}; bhāveśas in that house: ${joined.map((j) => j.h).join(', ') || 'none'}`,
      joined.length > 0
        ? {
            phala: `Income reaches you through ${joined
              .map((j) => HOUSE_NAME[j.h])
              .join(', ')} — the things you already hold and the people already around you, rather than through a single salary.`,
            tone: 'shubha',
            keywords: [],
            citation: citationOf('phaladipika.16.29'),
          }
        : undefined
    );
  }

  return { statements, tested };
}
