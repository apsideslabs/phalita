/**
 * PHALITA — bhāva phala, the twelve houses.
 *
 * Every rule here is a condition of Phaladīpikā 16 tested against the chart.
 * The order is the order of the houses: body, wealth, siblings, home, children,
 * health, spouse, longevity, fortune, career, gains.
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
            phala: `The lagna lord stands well placed in ${p1.rashiName}: the text gives a happy and growing life, and in its own or exalted sign an energetic, prosperous one.`,
            tone: 'shubha',
            keywords: [],
            citation: citationOf('phaladipika.16.4'),
          }
        : {
            phala: `The lagna lord is in debilitation: the text gives residence in an inferior place and a life lived at a distance from its own station.`,
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
          ? 'The lord of wealth sits in the second, but Saturn’s company turns it toward meagre means and little learning.'
          : withSun
          ? 'The lord of wealth sits in the second with the Sun: the text gives both learning and wealth.'
          : 'The lord of wealth sits in its own bhāva: the text gives wealth, family honour, a good name and far sight.',
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
          ? 'The lord of siblings is strong and well associated, so the text gives increase of brothers and sisters.'
          : 'The lord of siblings is weak and in a duḥsthāna, so the text gives loss of siblings.',
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
        phala: 'The lord of the fourth and Venus both stand well: the text gives vehicles, a seat of authority, gold and gems, ornaments, fine beds, and cattle, elephants and horses.',
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
        phala: 'The lord of the fourth is afflicted and Mars or the Sun burns the fourth: the text gives a burnt or ruined house, and property lost to others.',
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
        phala: 'The fifth lord is in benefic company: the text gives intelligence and a nature free of deceit.',
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
        phala: 'The lagna lord outweighs the sixth lord: the text gives health and a firm body.',
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
        phala: 'The sixth lord has fallen into a duḥsthāna while the lagna lord holds strength, so the text gives destruction of enemies.',
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
          phala: `The lord of house ${hostile.join(', ')} has fallen into the sixth, and the text says those bhāvas become hostile — the matter of ${
            hostile.map((h) => HOUSE_NAME[Number(h)]).join('; ')
          } is turned against the native.`,
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
        phala: 'The seventh lord is strong and benefic, and the text gives a wife who has a husband and a son, and is endowed with good qualities.',
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
        phala: 'The eighth lord stands outside the kendras and weaker than the lagna lord: the text gives long life, and freedom from distress, obstruction and affliction.',
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
        phala: 'The tenth lord is strong in a kendra or a koṇa and in its own or exalted sign: the text gives wide fame, a life of dharma and work, fortune like a king’s, and long life.',
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
        phala: `${sunOrMars.map((o) => GRAHA_PROPERTIES[o]?.name ?? o).join(' and ')} in the tenth: the text gives the accomplishing of great works with much prowess, and a following among people.`,
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
            phala: `The lord of gains sits with the lord of house ${joined.map((j) => j.h).join(', ')}, so the text gives gain of things belonging to ${
              joined.map((j) => HOUSE_NAME[j.h]).join('; ')
            }.`,
            tone: 'shubha',
            keywords: [],
            citation: citationOf('phaladipika.16.29'),
          }
        : undefined
    );
  }

  return { statements, tested };
}
