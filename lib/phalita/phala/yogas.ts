/**
 * PHALITA — the yoga layer (Phaladīpikā 6).
 *
 * A yoga is a condition, not an ornament: each of these names the exact
 * placement that produces it, so the engine tests it and reports it only when
 * it holds. The five mahāpuruṣa yogas are the ones a working astrologer looks
 * for first in any chart.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { citationOf } from './engine';
import type { PhalaStatement } from './types';
import type { TestedRule } from './bhava';

const KENDRA = [1, 4, 7, 10];
const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const DIGNIFIED = ['Exalted (Ucca)', 'Own Sign (Swakshetra)', 'Moolatrikona'];

const MAHAPURUSHA: { graha: PlanetId; name: string; verseId: string; phala: string }[] = [
  {
    graha: 'mars',
    name: 'Rucaka',
    verseId: 'phaladipika.6.2',
    phala: 'Rucaka — Mars in its own or exalted sign in a kendra: the text gives a long face, much daring, wealth, valour, a destroyer of enemies, strength, and a commander’s bearing.',
  },
  {
    graha: 'mercury',
    name: 'Bhadraka',
    verseId: 'phaladipika.6.2',
    phala: 'Bhadraka — Mercury in its own or exalted sign in a kendra: the text gives long life, keen intelligence, a spotless name, the praise of the learned, and a king’s estate with a crowded court.',
  },
  {
    graha: 'jupiter',
    name: 'Haṃsa',
    verseId: 'phaladipika.6.3',
    phala: 'Haṃsa — Jupiter in its own or exalted sign in a kendra: the text gives a ruler’s rank, auspicious marks on hand and foot, a fine body, virtuous conduct, wealth, good children and fame.',
  },
  {
    graha: 'venus',
    name: 'Mālava',
    verseId: 'phaladipika.6.3',
    phala: 'Mālava — Venus in its own or exalted sign in a kendra: the text gives comfort, fine vehicles and reputation, learning, and calm senses.',
  },
  {
    graha: 'saturn',
    name: 'Śaśa',
    verseId: 'phaladipika.6.4',
    phala: 'Śaśa — Saturn in its own or exalted sign in a kendra: the text gives authority over a village or a kingdom, good servants, and strength; it also warns of a nature that can turn to other men’s wives and money.',
  },
];

export interface YogaResult {
  statements: PhalaStatement[];
  tested: TestedRule[];
}

export function evaluateYogas(chart: JyotishaChart): YogaResult {
  const statements: PhalaStatement[] = [];
  const tested: TestedRule[] = [];
  const moon = chart.planets.moon;

  const push = (fired: boolean, rule: string, when: string, st?: PhalaStatement) => {
    tested.push({ rule, when, fired });
    if (fired && st) statements.push(st);
  };

  // Pañca mahāpuruṣa — 6.1–6.4
  for (const y of MAHAPURUSHA) {
    const p = chart.planets[y.graha];
    const fired = KENDRA.includes(p.house) && DIGNIFIED.includes(p.dignity);
    push(
      fired,
      `Phaladīpikā 6.2–6.4 (${y.name})`,
      `${GRAHA_PROPERTIES[y.graha]?.name} in house ${p.house} (${p.dignity})`,
      {
        phala: y.phala,
        tone: 'shubha',
        keywords: [y.name],
        citation: citationOf(y.verseId),
      }
    );
  }

  // Candra yogas — 6.5: planets in the 2nd and 12th from the Moon
  const houseFrom = (p: PlanetId, ref: number) =>
    (((chart.planets[p].rashiNumber - ref + 12) % 12) + 1);
  const others = (Object.keys(chart.planets) as PlanetId[]).filter(
    (p) => p !== 'moon' && p !== 'ketu'
  );
  const in2 = others.filter((p) => houseFrom(p, moon.rashiNumber) === 2);
  const in12 = others.filter((p) => houseFrom(p, moon.rashiNumber) === 12);
  const inKendraFromMoon = others.filter((p) =>
    [1, 4, 7, 10].includes(houseFrom(p, moon.rashiNumber))
  );

  const sunapha = in2.length > 0 && in12.length === 0;
  const anapha = in12.length > 0 && in2.length === 0;
  const durudhara = in2.length > 0 && in12.length > 0;
  const kemadruma = in2.length === 0 && in12.length === 0 && inKendraFromMoon.length === 0;

  push(
    sunapha,
    'Phaladīpikā 6.5–6.6 (sunaphā)',
    `planets in 2nd from Moon: ${in2.length}, in 12th: ${in12.length}`,
    {
      phala: 'Sunaphā — grahas in the second from the Moon and none in the twelfth: the text gives wealth gathered by one’s own effort, a rank equal to a king’s, and a name for wisdom and money.',
      tone: 'shubha',
      keywords: ['Sunaphā'],
      citation: citationOf('phaladipika.6.6'),
    }
  );
  push(
    anapha,
    'Phaladīpikā 6.5–6.6 (anaphā)',
    `planets in 12th from Moon: ${in12.length}, in 2nd: ${in2.length}`,
    {
      phala: 'Anaphā — grahas in the twelfth from the Moon and none in the second: the text gives a body free of disease, good conduct, wide fame, the enjoyment of pleasures, fine dress and contentment.',
      tone: 'shubha',
      keywords: ['Anaphā'],
      citation: citationOf('phaladipika.6.6'),
    }
  );
  push(
    durudhara,
    'Phaladīpikā 6.5, 6.7 (durudharā)',
    `planets in 2nd and 12th from Moon: ${in2.length}/${in12.length}`,
    {
      phala: 'Durudharā — grahas on both sides of the Moon: the text gives enjoyment, wealth, vehicles, servants, and a generous nature.',
      tone: 'shubha',
      keywords: ['Durudharā'],
      citation: citationOf('phaladipika.6.7'),
    }
  );
  push(
    kemadruma,
    'Phaladīpikā 6.5 (kemadruma)',
    `planets in 2nd/12th from Moon: ${in2.length}/${in12.length}; in kendra from Moon: ${inKendraFromMoon.length}`,
    {
      phala: 'Kemadruma — no graha in the second or the twelfth from the Moon and none in a kendra from it. The text gives a life of want and dependence: a servant of others, a man of poor company, and one fallen from his family’s standing. Verse 6.5 itself adds that the yoga is absent if the Moon has a graha in a kendra from it.',
      tone: 'ashubha',
      keywords: ['Kemadruma'],
      citation: citationOf('phaladipika.6.7'),
    }
  );

  // Amala — 6.12: a benefic in the tenth from the Moon or from the lagna
  const amalaMoon = others.filter(
    (p) => BENEFICS.includes(p) && houseFrom(p, moon.rashiNumber) === 10
  );
  const amalaLagna = others.filter(
    (p) => BENEFICS.includes(p) && chart.planets[p].house === 10
  );
  push(
    amalaMoon.length > 0 || amalaLagna.length > 0,
    'Phaladīpikā 6.12 (amala)',
    `benefics in 10th from Moon: ${amalaMoon.length}; in the 10th from lagna: ${amalaLagna.length}`,
    {
      phala: 'Amala — a benefic in the tenth from the Moon or the lagna: the text gives good conduct, a serene and fortunate disposition, honour from rulers, gentle speech, and wealth.',
      tone: 'shubha',
      keywords: ['Amala'],
      citation: citationOf('phaladipika.6.12'),
    }
  );

  // Kesarī — 6.14/6.16: Jupiter in a kendra from the Moon
  const jup = chart.planets.jupiter;
  const kesari = [1, 4, 7, 10].includes(houseFrom('jupiter', moon.rashiNumber));
  push(
    kesari,
    'Phaladīpikā 6.16 (kesarī)',
    `Jupiter in house ${houseFrom('jupiter', moon.rashiNumber)} from the Moon (${jup.rashiName})`,
    {
      phala: 'Kesarī — Jupiter in a kendra from the Moon: the text gives the destruction of enemies like a lion, weighty speech, a kingly bearing in assembly, long life, wide fame and a sharp intelligence that wins by force of character.',
      tone: 'shubha',
      keywords: ['Kesarī'],
      citation: citationOf('phaladipika.6.16'),
    }
  );

  // Malefic affliction of the Moon — the counterweight the text itself supplies
  const moonAfflicted = [chart.planets.saturn, chart.planets.mars, chart.planets.sun].some(
    (p) => (p.aspectsToHouses ?? []).includes(moon.house)
  );
  if (moonAfflicted && kemadruma) {
    const kem = statements.find((s) => s.keywords.includes('Kemadruma'));
    if (kem) {
      kem.modifiedBy = [
        {
          verseId: 'phaladipika.6.5',
          short: 'Phaladīpikā 6.5',
          effect: 'obstructed',
          detail:
            'The Moon is under malefic dṛṣṭi here, which is the condition the text names when it says the kemadruma is not produced. Treat this reading as weakened.',
        },
      ];
    }
  }

  void MALEFICS;
  return { statements, tested };
}
