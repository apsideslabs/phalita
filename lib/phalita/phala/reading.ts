/**
 * PHALITA — the full reading.
 *
 * One birth, one page: svabhāva (character), yogas, the twelve bhāvas,
 * vivāha (marriage), āyurdāya (longevity) and gochara (the present). Each
 * section is a set of conditional rules, and every rule is a verse of
 * Phaladīpikā whose conditions the engine actually tests. A rule that cannot
 * fire is not in the corpus.
 *
 * Where a rule's harsh reading is cancelled by a later verse of the same text —
 * 10.7 cancelling 10.15, for instance — the cancellation is applied and both
 * are shown. The text is allowed to argue with itself; the engine does not
 * quietly pick the side that sounds better.
 */

import type { JyotishaChart, PlanetId, RashiNumber } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '@/lib/jyotisha/constants';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { buildPhalaReport, citationOf } from './engine';
import { PHALADIPIKA_10_VERSES } from './corpus-phaladipika-10';
import { PHALADIPIKA_22_VERSES } from './corpus-phaladipika-22';
import type { PhalaStatement, GocharaReading } from './types';
import { evaluateBhavas } from './bhava';
import { evaluateYogas } from './yogas';

const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];

export interface ReadingSection {
  id: 'svabhava' | 'yogas' | 'bhava' | 'vivaha' | 'ayus' | 'gochara';
  title: string;
  sanskrit: string;
  intro: string;
  statements: PhalaStatement[];
  /** Shown when a section could not be completed, and why. */
  note?: string;
  /** Rules that were tested and did not fire — the negative evidence. */
  tested: { rule: string; when: string; fired: boolean }[];
}

export interface FullReading {
  janmaRashi: RashiNumber;
  janmaRashiName: string;
  janmaNakshatra: string;
  sections: ReadingSection[];
  gochara: GocharaReading;
  versesUsed: string[];
  date: string;
}

const st = (
  verseId: string,
  phala: string,
  tone: 'shubha' | 'ashubha' | 'mishra',
  extra: Partial<PhalaStatement> = {}
): PhalaStatement => ({
  phala,
  tone,
  keywords: [],
  citation: citationOf(verseId),
  ...extra,
});

export function buildReading(
  chart: JyotishaChart,
  date: Date = new Date(),
  ayanamshaType: AyanamshaType = 'lahiri'
): FullReading {
  const base = buildPhalaReport(chart, date, ayanamshaType);

  const house1 = chart.bhavas[0];
  const house7 = chart.bhavas[6];
  const lagnaLord = house1?.rashiLord as PlanetId | undefined;
  const lord7 = house7?.rashiLord as PlanetId | undefined;
  const lagna = lagnaLord ? chart.planets[lagnaLord] : undefined;
  const p7 = lord7 ? chart.planets[lord7] : undefined;

  const occupants = (house7?.planetsInHouse ?? []) as PlanetId[];
  const aspecting = (ids: PlanetId[]) =>
    (Object.values(chart.planets) as { id: PlanetId; aspectsToHouses: number[] }[])
      .filter((pl) => ids.includes(pl.id) && (pl.aspectsToHouses ?? []).includes(7))
      .map((pl) => pl.id);

  const maleficsIn7 = occupants.filter((p) => MALEFICS.includes(p));
  const beneficsIn7 = occupants.filter((p) => BENEFICS.includes(p));
  // 10.7 and 10.15 speak of dr̥ṣṭi as well as conjunction.
  const maleficAspects7 = aspecting(MALEFICS);
  const beneficAspects7 = aspecting(BENEFICS);

  // ---- Svabhāva -----------------------------------------------------------
  const svabhava: ReadingSection = {
    id: 'svabhava',
    title: 'Svabhāva — Character & Constitution',
    sanskrit: 'स्वभाव',
    intro:
      'The rāśi reading is the pañjikā reading: the Moon’s sign describes the body and the temper. The lagna lord’s dignity then colours it, by the rules of Phaladīpikā 9.',
    statements: [base.rashiReading],
    tested: [],
  };

  if (lagna) {
    const d = lagna.dignity;
    const dignityRule = (() => {
      if (d === 'Exalted (Ucca)') {
        return st('phaladipika.9.14', `The lagna lord ${lagna.name} is exalted: the text gives possession of treasure, praise from rulers, a seat of honour, and mastery in conduct, fame and generosity.`, 'shubha');
      }
      if (d === 'Debilitated (Neecha)') {
        return st('phaladipika.9.18', `The lagna lord ${lagna.name} is debilitated: the text gives a fall from one’s own station, poverty, ill conduct and debt.`, 'ashubha');
      }
      if (d === 'Enemy (Shatru)' || d === 'Great Enemy (Adhi Shatru)') {
        return st('phaladipika.9.17', `The lagna lord ${lagna.name} sits in an enemy’s house: the text gives decline, living on others’ food, and residence in another’s house.`, 'ashubha');
      }
      if (d === 'Friend (Mitra)' || d === 'Great Friend (Adhi Mitra)') {
        return st('phaladipika.9.16', `The lagna lord ${lagna.name} sits in a friend’s house: the text gives success in undertakings through friends, good children and spouse, wealth and grain.`, 'shubha');
      }
      if (d === 'Own Sign (Swakshetra)' || d === 'Moolatrikona') {
        return st('phaladipika.9.19', `The lagna lord ${lagna.name} is in its own sign, and the text says a graha in its own rāśi gives no special phala — it gives what the rest of the chart has already said, steadily.`, 'mishra');
      }
      return null;
    })();
    svabhava.tested.push({
      rule: 'Phaladīpikā 9.14–9.19',
      when: `lagna lord ${lagna.name} in ${d}`,
      fired: Boolean(dignityRule),
    });
    if (dignityRule) svabhava.statements.push(dignityRule);

    if (lagna.isRetrograde) {
      svabhava.statements.push(
        st('phaladipika.9.20', `The lagna lord ${lagna.name} is retrograde; 9.20 says a retrograde graha gives the phala of its exaltation.`, 'shubha')
      );
    }
  }

  // ---- Yogas --------------------------------------------------------------
  const yogaResult = evaluateYogas(chart);
  const yogas: ReadingSection = {
    id: 'yogas',
    title: 'Yogas — Combinations',
    sanskrit: 'योग',
    intro:
      'A yoga is a condition, not a decoration. Each of these names the exact placement that produces it, and is reported only when the chart holds it.',
    statements: yogaResult.statements,
    note:
      yogaResult.statements.length === 0
        ? 'None of the classical yogas held in this chart. The rules tested are listed below, so you can see what was looked for.'
        : undefined,
    tested: yogaResult.tested,
  };

  // ---- Bhāva phala — the twelve houses ------------------------------------
  const bhavaResult = evaluateBhavas(chart);
  const bhava: ReadingSection = {
    id: 'bhava',
    title: 'Bhāva Phala — The Twelve Sectors of Life',
    sanskrit: 'द्वादश भावफल',
    intro:
      'House by house, from Phaladīpikā 16: body, wealth, siblings, home, children, health, marriage, longevity, fortune, career and gains.',
    statements: bhavaResult.statements,
    note:
      bhavaResult.statements.length === 0
        ? 'No bhāva condition of chapter 16 held in this chart.'
        : undefined,
    tested: bhavaResult.tested,
  };

  // ---- Vivāha -------------------------------------------------------------
  const vivaha: ReadingSection = {
    id: 'vivaha',
    title: 'Vivāha — Marriage',
    sanskrit: 'विवाह',
    intro:
      'The seventh bhāva, its lord, and the benefic or malefic company it keeps. Phaladīpikā 10 tests conditions; where a hard reading is cancelled by 10.7, both are shown.',
    statements: [],
    tested: [],
  };

  const push = (
    fired: boolean,
    rule: string,
    when: string,
    statement?: PhalaStatement
  ) => {
    vivaha.tested.push({ rule, when, fired });
    if (fired && statement) vivaha.statements.push(statement);
  };

  if (p7 && house7) {
    const lordIn6 = p7.house === 6;
    const lordDebilitated = p7.dignity === 'Debilitated (Neecha)';
    const seventhAfflicted = maleficsIn7.length > 0 || maleficAspects7.length > 0;
    const hardReading = lordIn6 || lordDebilitated || seventhAfflicted;

    push(
      hardReading,
      'Phaladīpikā 10.15',
      `7th lord ${p7.name} in house ${p7.house} (${p7.dignity}); malefics in the 7th: ${maleficsIn7.length}`,
      st(
        'phaladipika.10.15',
        `The seventh lord is ${
          lordDebilitated ? 'in debilitation' : lordIn6 ? 'in the sixth' : 'afflicted'
        }${
          maleficsIn7.length
            ? `, and the seventh is held by ${maleficsIn7
                .map((m) => GRAHA_PROPERTIES[m]?.name ?? m)
                .join(', ')}`
            : ''
        }${
          maleficAspects7.length
            ? `, and the seventh is aspected by ${maleficAspects7
                .map((m) => GRAHA_PROPERTIES[m]?.name ?? m)
                .join(', ')}`
            : ''
        } — the text declares loss of the spouse (kalatra-hāni).`,
        'ashubha'
      )
    );

    // 10.7 — benefic company on the seventh removes the fault.
    const cancelled =
      beneficsIn7.length > 0 ||
      beneficAspects7.length > 0 ||
      p7.dignity === 'Exalted (Ucca)' ||
      p7.dignity === 'Own Sign (Swakshetra)';
    push(
      cancelled,
      'Phaladīpikā 10.7',
      `benefics in the 7th: ${beneficsIn7.length}, aspecting: ${beneficAspects7.length}; 7th lord dignity ${p7.dignity}`,
      st(
        'phaladipika.10.7',
        `Benefic company stands against that reading — ${
          beneficsIn7.length
            ? beneficsIn7.map((b) => GRAHA_PROPERTIES[b]?.name ?? b).join(', ') + ' in the seventh'
            : beneficAspects7.length
            ? 'the seventh is aspected by ' +
              beneficAspects7.map((b) => GRAHA_PROPERTIES[b]?.name ?? b).join(', ')
            : 'the seventh lord stands in its own dignity'
        }. The text says that with benefic aspect there is no fault, and the couple is fortunate.`,
        'shubha'
      )
    );

    // 10.13 — lagna lord in the seventh.
    push(
      Boolean(lagna && lagna.house === 7),
      'Phaladīpikā 10.13',
      `lagna lord ${lagna?.name} in house ${lagna?.house}`,
      st('phaladipika.10.13', `The lagna lord has reached the seventh bhāva, and the text says plainly: there is gain of a spouse.`, 'shubha')
    );

    // 10.9 — 7th lord strong and not burnt by the Sun.
    const strong9 = !p7.isCombust && (p7.dignity === 'Exalted (Ucca)' || p7.dignity === 'Own Sign (Swakshetra)' || p7.dignity === 'Moolatrikona' || p7.dignity === 'Friend (Mitra)' || p7.dignity === 'Great Friend (Adhi Mitra)');
    push(
      strong9,
      'Phaladīpikā 10.9',
      `7th lord ${p7.name} combust: ${p7.isCombust}; dignity ${p7.dignity}`,
      st('phaladipika.10.9', `The seventh lord is free of the Sun’s burning and carries strength, so the text gives a spouse together with children.`, 'shubha')
    );

    // 10.2 — 7th lord in the fifth; 8th lord in the seventh.
    const lord8 = chart.bhavas[7]?.rashiLord as PlanetId | undefined;
    const p8 = lord8 ? chart.planets[lord8] : undefined;
    const fired102 = p7.house === 5 || p8?.house === 7;
    push(
      fired102,
      'Phaladīpikā 10.2',
      `7th lord in house ${p7.house}; 8th lord ${p8?.name} in house ${p8?.house}`,
      st(
        'phaladipika.10.2',
        p7.house === 5
          ? 'The lord of the seventh sits in the fifth, and the text says the native is bereft of a wife, or childless.'
          : 'The lord of the eighth sits in the seventh, and the text says it certainly causes loss of the wife.',
        'ashubha'
      )
    );

    // 10.6 — a strong benefic seventh lord.
    const beneficLord = p7.naturalBenefic;
    push(
      beneficLord && strong9,
      'Phaladīpikā 10.6',
      `7th lord ${p7.name} benefic: ${beneficLord}; strong: ${strong9}`,
      st('phaladipika.10.6', `The seventh lord is benefic and strong, and the text gives a virtuous wife together with good children.`, 'shubha')
    );
  }

  if (vivaha.statements.length === 0) {
    vivaha.note =
      'None of the conditions held in this chart, so this build states nothing about marriage rather than inventing a reading.';
  }

  // ---- Āyurdāya -----------------------------------------------------------
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const sunStrength = sb.sun?.totalVirupas ?? 0;
  const moonStrength = sb.moon?.totalVirupas ?? 0;
  const lagnaStrength = lagnaLord ? sb[lagnaLord]?.totalVirupas ?? 0 : 0;

  const strongest =
    lagnaStrength >= sunStrength && lagnaStrength >= moonStrength
      ? 'aṃśāyu (from the lagna)'
      : sunStrength >= moonStrength
      ? 'piṇḍāyu (from the Sun)'
      : 'naisargika (from the Moon)';

  const ayus: ReadingSection = {
    id: 'ayus',
    title: 'Āyurdāya — Longevity',
    sanskrit: 'आयुर्दाय',
    intro:
      'The texts give a longevity, and the tradition argues about how to compute it. This platform reports the method the chart selects and the classical ceiling, and it does not name a death date.',
    statements: [
      st(
        'phaladipika.22.28',
        `Of the three methods, this chart selects ${strongest}: the lagna lord is at ${lagnaStrength.toFixed(1)} virūpas, the Sun at ${sunStrength.toFixed(1)}, the Moon at ${moonStrength.toFixed(1)}. The text assigns aṃśāyu to the lagna’s strength, piṇḍāyu to the Sun’s and naisargika to the Moon’s.${
          lagnaLord === 'sun'
            ? ' Here the lagna lord is the Sun, so the aṃśāyu and piṇḍāyu inputs are the same figure and only the Moon separates the three.'
            : ''
        }`,
        'mishra'
      ),
      st(
        'phaladipika.22.26',
        'The ceiling the text will name is a hundred autumns — the Veda-declared maximum, which Phaladīpikā adopts against the shorter figures other authorities give.',
        'shubha'
      ),
      st(
        'phaladipika.22.24',
        'The piṇḍāyu is treated as primary by Māṇittha and Cāṇakya, but the text records that Bhadanta rejected it as unsound, and that Varāhamihira said the same. The authorities disagree, and this platform does not compute a date from a disputed method.',
        'mishra'
      ),
    ],
    note:
      'The piṇḍāyu and aṃśāyu arithmetic of 22.21–22.23 is not implemented. It depends on the haraṇa reductions, and 22.24 records that the tradition itself disputes the result. A death date is not produced here, by design.',
    tested: [
      {
        rule: 'Phaladīpikā 22.28',
        when: `lagna ${lagnaStrength.toFixed(1)} / Sun ${sunStrength.toFixed(1)} / Moon ${moonStrength.toFixed(1)} virūpas`,
        fired: true,
      },
    ],
  };

  // ---- Gochara ------------------------------------------------------------
  const gochara: ReadingSection = {
    id: 'gochara',
    title: 'Gochara — The Present',
    sanskrit: 'गोचर',
    intro:
      'The transits of nine grahas counted from the janma rāśi for the date shown, with vedha and the aṣṭakavarga bindus applied.',
    statements: base.gochara.statements,
    note:
      base.gochara.unstated.length > 0
        ? `Not stated in the text for this chart: ${base.gochara.unstated
            .map((u) => `${GRAHA_PROPERTIES[u.graha]?.name ?? u.graha} in the ${u.bhava}th`)
            .join(', ')}.`
        : undefined,
    tested: [],
  };

  const versesUsed = Array.from(
    new Set([
      ...base.versesUsed,
      ...svabhava.statements.map((s) => s.citation.verseId),
      ...vivaha.statements.map((s) => s.citation.verseId),
      ...ayus.statements.map((s) => s.citation.verseId),
      ...yogas.statements.map((s) => s.citation.verseId),
      ...bhava.statements.map((s) => s.citation.verseId),
    ])
  );

  return {
    janmaRashi: base.janmaRashi,
    janmaRashiName: base.janmaRashiName,
    janmaNakshatra: base.janmaNakshatra,
    sections: [svabhava, yogas, bhava, vivaha, ayus, gochara],
    gochara: base.gochara,
    versesUsed,
    date: base.gochara.date,
  };
}

export { PHALADIPIKA_10_VERSES, PHALADIPIKA_22_VERSES };
