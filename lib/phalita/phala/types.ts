/**
 * PHALITA — phala engine types.
 *
 * The engine is built around one rule: **no statement without a mūla.** Every
 * prediction this platform makes is produced by a verse that is stored here in
 * Devanagari, with its text, chapter and śloka number, and a reading of that
 * verse. If a verse does not state something, the engine says so rather than
 * filling the gap.
 */

import type { PlanetId, RashiNumber } from '@/lib/jyotisha/types';

/** A classical work the corpus draws on. */
export interface PhalaSource {
  /** Short id used in citations, e.g. "phaladipika" */
  id: string;
  /** Title as printed */
  title: string;
  /** Sanskrit title */
  titleSa: string;
  /** Author, as traditionally ascribed */
  author: string;
  /** Date or period, as far as it is settled */
  period: string;
  /** Which digital text the Devanagari was taken from, with its licence */
  etext: {
    provider: string;
    url: string;
    licence: string;
    /** Date the copy was taken */
    retrieved: string;
    /** The caveat the e-text itself carries */
    note: string;
  };
}

/** One verse, stored verbatim. */
export interface PhalaVerse {
  /** "phaladipika.26.9" */
  id: string;
  sourceId: string;
  adhyaya: number;
  /** Printed śloka number, as a string because some are ranges ("9-11") */
  shloka: string;
  /** Devanagari mūla, exactly as in the e-text */
  mula: string;
  /** What the verse is about, in one line */
  subject: string;
  /**
   * Set when the verse's list of effects does not map one-to-one onto the
   * houses it is said to cover. The engine then reports only what the verse
   * states, and the UI shows this note.
   */
  mappingNote?: string;
}

/** One parsed effect: what a verse says happens in one house. */
export interface PhalaRow {
  verseId: string;
  /** Planet whose transit or placement is described */
  graha: PlanetId;
  /** House counted from the janma rāśi (gochara) or from the lagna */
  bhava: number;
  /** The effect, rendered from the Sanskrit. The platform's own reading. */
  phala: string;
  /** Sanskrit keywords lifted from the verse itself */
  keywords: string[];
  /** 'benefic' | 'malefic' | 'mixed' as the verse reads */
  tone: 'shubha' | 'ashubha' | 'mishra';
}

/** A verse attached to a rāśi (Phaladīpikā ch. 9). */
export interface RashiPhala {
  rashi: RashiNumber;
  verseId: string;
  /** Sanskrit name of the rāśi */
  rashiName: string;
  /** What the text says of a person born with the Moon in this rāśi */
  phala: string;
  keywords: string[];
}

/** A resolved statement in a reading: phala + the verse that produced it. */
export interface PhalaStatement {
  graha?: PlanetId;
  bhava?: number;
  rashi?: RashiNumber;
  phala: string;
  keywords: string[];
  tone: 'shubha' | 'ashubha' | 'mishra';
  citation: {
    verseId: string;
    short: string;
    mula: string;
    adhyaya: number;
    shloka: string;
    sourceTitle: string;
  };
  /** Set when a later verse of the same text modifies this result. */
  modifiedBy?: {
    verseId: string;
    short: string;
    effect: 'cancelled' | 'obstructed' | 'reinforced';
    detail: string;
  }[];
}

export interface GocharaReading {
  /** The date the transits were computed for */
  date: string;
  /** Janma rāśi — the reference the text says to use */
  janmaRashi: RashiNumber;
  janmaRashiName: string;
  statements: PhalaStatement[];
  /** Houses where the text gives no effect for that planet */
  unstated: { graha: PlanetId; bhava: number; reason: string }[];
}

export interface PhalaReport {
  janmaRashi: RashiNumber;
  janmaRashiName: string;
  janmaNakshatra: string;
  rashiReading: PhalaStatement;
  gochara: GocharaReading;
  /** Every verse consulted, for the audit view */
  versesUsed: string[];
  /** Coverage disclosure — what this build does and does not cover */
  coverage: {
    texts: string[];
    families: { name: string; status: 'complete' | 'partial' | 'pending'; detail: string }[];
  };
}
