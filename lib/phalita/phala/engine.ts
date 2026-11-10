/**
 * PHALITA — the phala engine.
 *
 * Reads a calculated chart (from the GAṆAKA engine) and produces predictions
 * that are nothing but verses applied. The order is the order the Kāmarūpa
 * pañjikā tradition uses:
 *
 *   1. the janma rāśi — what the Moon's sign says of the native (Phaladīpikā 9);
 *   2. the gochara — each graha's transit counted from that same janma rāśi
 *      (Phaladīpikā 26), never from the lagna alone;
 *   3. vedha — a benefic transit is obstructed if the vedha house is occupied
 *      (Phaladīpikā 26.3–8);
 *   4. aṣṭakavarga — the bindu count in the transited rāśi modifies the result
 *      (Phaladīpikā 26.41).
 *
 * Nothing here invents a statement. If a verse does not cover a house, the
 * reading says so.
 */

import type { JyotishaChart, PlanetId, RashiNumber } from '@/lib/jyotisha/types';
import { RASHIS, GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { calculateCurrentTransits } from '@/lib/jyotisha/transits';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { PHALADIPIKA_26_VERSES, PHALADIPIKA_26_ROWS } from './corpus-phaladipika-26';
import { PHALADIPIKA_09_VERSES, PHALADIPIKA_09_RASHIS } from './corpus-phaladipika-09';
import { PHALADIPIKA_10_VERSES } from './corpus-phaladipika-10';
import { PHALADIPIKA_22_VERSES } from './corpus-phaladipika-22';
import type {
  GocharaReading,
  PhalaReport,
  PhalaSource,
  PhalaStatement,
  PhalaVerse,
} from './types';

export const SOURCES: PhalaSource[] = [
  {
    id: 'phaladipika',
    title: 'Phaladīpikā',
    titleSa: 'फलदीपिका',
    author: 'Mantreśvara',
    period: 'c. 15th century CE',
    etext: {
      provider: 'Sanskrit Wikisource (सङ्कृतविकिस्रोत)',
      url: 'https://sa.wikisource.org/wiki/फलदीपिका',
      licence: 'CC BY-SA 4.0',
      retrieved: '2026-11-10',
      note:
        'The e-text is a typed transcription, not OCR of a printed page, but it states that full proofreading against the printed edition is still pending. Verse numbering follows that transcription.',
    },
  },
];

export const ALL_VERSES: PhalaVerse[] = [
  ...PHALADIPIKA_09_VERSES,
  ...PHALADIPIKA_10_VERSES,
  ...PHALADIPIKA_22_VERSES,
  ...PHALADIPIKA_26_VERSES,
];

const VERSE_BY_ID = new Map(ALL_VERSES.map((v) => [v.id, v]));

export function getVerse(id: string): PhalaVerse | undefined {
  return VERSE_BY_ID.get(id);
}

/** "Phaladīpikā 26.12" — the short citation form. */
export function shortCitation(verseId: string): string {
  const v = VERSE_BY_ID.get(verseId);
  if (!v) return verseId;
  const src = SOURCES.find((s) => s.id === v.sourceId);
  return `${src?.title ?? v.sourceId} ${v.adhyaya}.${v.shloka}`;
}

export function citationOf(verseId: string): PhalaStatement['citation'] {
  const v = VERSE_BY_ID.get(verseId);
  return {
    verseId,
    short: shortCitation(verseId),
    mula: v?.mula ?? '',
    adhyaya: v?.adhyaya ?? 0,
    shloka: v?.shloka ?? '',
    sourceTitle: SOURCES.find((s) => s.id === v?.sourceId)?.title ?? '',
  };
}

const GOCHARA_ORDER: PlanetId[] = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
];

/**
 * Ketu has no separate chapter in Phaladīpikā 26: the text treats the nodes
 * together ("तमःखेचरयोर्वदन्तु", 26.40) and gives the phala in 26.24 for the
 * node. Ketu's rows are therefore reported as unstated rather than guessed.
 */
const VERSES_WITH_ROWS = new Set(PHALADIPIKA_26_ROWS.map((r) => r.verseId));

export function buildPhalaReport(
  chart: JyotishaChart,
  date: Date = new Date(),
  ayanamshaType: AyanamshaType = 'lahiri'
): PhalaReport {
  const janmaRashi = chart.planets.moon.rashiNumber as RashiNumber;
  const janmaRashiName = RASHIS[janmaRashi]?.sanskritName ?? '';

  // ---- 1. Janma rāśi ------------------------------------------------------
  const rashiEntry = PHALADIPIKA_09_RASHIS.find((r) => r.rashi === janmaRashi);
  const rashiReading: PhalaStatement = rashiEntry
    ? {
        rashi: janmaRashi,
        phala: rashiEntry.phala,
        keywords: rashiEntry.keywords,
        tone: 'mishra',
        citation: citationOf(rashiEntry.verseId),
      }
    : {
        rashi: janmaRashi,
        phala: 'No rāśi reading is held for this sign in the current corpus.',
        keywords: [],
        tone: 'mishra',
        citation: citationOf('phaladipika.9.1'),
      };

  // ---- 2–4. Gochara -------------------------------------------------------
  const transits = calculateCurrentTransits(
    janmaRashi,
    chart.lagna.rashiNumber as RashiNumber,
    ayanamshaType,
    date
  );

  const bavByRashi = (planet: PlanetId): number[] | null => {
    const av = chart.ashtakavarga as unknown as {
      bav?: Record<string, { bindusByRashi?: number[] }>;
    };
    return av.bav?.[planet]?.bindusByRashi ?? null;
  };

  const statements: PhalaStatement[] = [];
  const unstated: GocharaReading['unstated'] = [];

  for (const planet of GOCHARA_ORDER) {
    const t = transits.planets.find((p) => p.id === planet);
    if (!t) continue;
    const bhava = t.houseFromNatalMoon;
    const row = PHALADIPIKA_26_ROWS.find((r) => r.graha === planet && r.bhava === bhava);

    if (!row) {
      unstated.push({
        graha: planet,
        bhava,
        reason: VERSES_WITH_ROWS.size
          ? `${GRAHA_PROPERTIES[planet]?.name ?? planet} in the ${bhava}th from the janma rāśi is not stated in Phaladīpikā 26 as transcribed in this corpus.`
          : 'not covered',
      });
      continue;
    }

    const statement: PhalaStatement = {
      graha: planet,
      bhava,
      phala: row.phala,
      keywords: row.keywords,
      tone: row.tone,
      citation: citationOf(row.verseId),
      modifiedBy: [],
    };

    // Vedha — 26.3–8: a benefic transit is obstructed when the vedha house is held.
    if (t.hasVedhaObstruction) {
      statement.modifiedBy!.push({
        verseId: 'phaladipika.26.3',
        short: 'Phaladīpikā 26.3–8',
        effect: 'obstructed',
        detail: `The vedha house (${t.vedhaHouse}) is occupied${
          t.obstructingPlanets?.length
            ? ` by ${t.obstructingPlanets
                .map((p) => GRAHA_PROPERTIES[p]?.name ?? p)
                .join(', ')}`
            : ''
        }, so this benefic transit is obstructed.`,
      });
    }

    // Aṣṭakavarga — 26.41: the bindu count in the transited rāśi modifies the phala.
    const bindus = bavByRashi(planet);
    if (bindus && bindus.length === 12) {
      const count = bindus[t.transitRashi - 1];
      if (typeof count === 'number') {
        const name = GRAHA_PROPERTIES[planet]?.name ?? planet;
        // More bindus is more auspicious: on a benefic statement that strengthens
        // the result, on an affliction it lightens it.
        if (count >= 5) {
          statement.modifiedBy!.push({
            verseId: 'phaladipika.26.41',
            short: 'Phaladīpikā 26.41',
            effect: 'reinforced',
            detail:
              row.tone === 'ashubha'
                ? `${name} holds ${count} bindus in ${t.transitRashiName}, above the average of four — the text makes this auspicious, so the difficulty is lightened.`
                : `${name} holds ${count} bindus in ${t.transitRashiName}, above the average of four — the phala is strengthened.`,
          });
        } else if (count <= 2) {
          statement.modifiedBy!.push({
            verseId: 'phaladipika.26.41',
            short: 'Phaladīpikā 26.41',
            effect: 'cancelled',
            detail:
              row.tone === 'ashubha'
                ? `${name} holds only ${count} bindus in ${t.transitRashiName}, below the average — what is auspicious is weak here, so the affliction is not lightened.`
                : `${name} holds only ${count} bindus in ${t.transitRashiName}, below the average — the phala is much weakened.`,
          });
        }
      }
    }

    statements.push(statement);
  }

  const gochara: GocharaReading = {
    date: date.toISOString(),
    janmaRashi,
    janmaRashiName,
    statements,
    unstated,
  };

  const versesUsed = Array.from(
    new Set([
      rashiReading.citation.verseId,
      ...statements.map((s) => s.citation.verseId),
      ...statements.flatMap((s) => (s.modifiedBy ?? []).map((m) => m.verseId)),
    ])
  );

  return {
    janmaRashi,
    janmaRashiName,
    janmaNakshatra: chart.planets.moon.nakshatraName,
    rashiReading,
    gochara,
    versesUsed,
    coverage: {
      texts: SOURCES.map((s) => `${s.title} (${s.author}, ${s.period})`),
      families: [
        {
          name: 'Rāśi phala — janma rāśi',
          status: 'complete',
          detail: 'All twelve rāśis, Phaladīpikā 9.1–9.12, plus the Candra-lagna rule at 9.13.',
        },
        {
          name: 'Gochara phala — nine grahas',
          status: 'partial',
          detail:
            'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn and Rāhu are complete for all twelve houses (26.9–26.24). Ketu is not separately stated in the text and is reported as unstated.',
        },
        {
          name: 'Vedha — transit obstruction',
          status: 'complete',
          detail: 'The vedha pairs of 26.3–26.8, applied to every benefic transit.',
        },
        {
          name: 'Aṣṭakavarga modification of transit',
          status: 'complete',
          detail: '26.41, applied from the bhinnaṣṭakavarga bindus of the transited rāśi.',
        },
        {
          name: 'Svabhāva — character and constitution',
          status: 'complete',
          detail:
            'The janma-rāśi reading (9.1–9.12) plus the lagna lord’s dignity rules of 9.14–9.20.',
        },
        {
          name: 'Vivāha — marriage',
          status: 'partial',
          detail:
            'Six testable conditions of Phaladīpikā 10: the seventh lord in the fifth or sixth, in debilitation, the seventh afflicted by malefic conjunction or dṛṣṭi, the lagna lord in the seventh, a strong benefic seventh lord, and the 10.7 cancellation. The remaining verses of ch. 10 need the upapada and the dṛṣṭi of the seventh from Venus, which this build does not yet evaluate.',
        },
        {
          name: 'Āyurdāya — longevity',
          status: 'partial',
          detail:
            'The method the chart selects (22.28), the Vedic ceiling (22.26) and the tradition’s own objection to the piṇḍāyu (22.24). No death date is computed: the haraṇa reductions of 22.21–22.23 are not implemented and 22.24 records the dispute.',
        },
        {
          name: 'Bhāva phala — the twelve houses',
          status: 'pending',
          detail:
            'Phaladīpikā 8 (bhāvāśraya) and 15–16 (dvādaśa-bhāva-phala) are not yet transcribed into the corpus.',
        },
        {
          name: 'Daśā phala — period results',
          status: 'pending',
          detail: 'Phaladīpikā 19–20 (daśā-phala) are not yet transcribed.',
        },
        {
          name: 'Nakṣatra phala — the 27 stars',
          status: 'pending',
          detail: 'Requires the nakṣatra chapters of BPHS (34–45) or the regional pañjikā text.',
        },
      ],
    },
  };
}
