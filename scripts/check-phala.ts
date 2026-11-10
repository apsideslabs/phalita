/**
 * Corpus integrity check for the phala engine.
 *
 * The engine may only state what a verse states, so the corpus itself has to be
 * sound. This fails the build if any of the following is untrue:
 *
 *   1. every parsed row points at a verse that exists;
 *   2. every verse carries Devanagari mūla text;
 *   3. no (graha, bhava) pair is stated twice;
 *   4. all twelve rāśis have a reading;
 *   5. every gap in the gochara table is one the corpus declares, not an
 *      accident.
 */

import {
  ALL_VERSES,
  PHALADIPIKA_26_ROWS,
  PHALADIPIKA_09_RASHIS,
} from '../lib/phalita/phala';

const DEVANAGARI = /[\u0900-\u097F]/;
let bad = 0;
const fail = (msg: string) => {
  console.log(`::error::${msg}`);
  bad++;
};

// 1. rows resolve to verses
const verseIds = new Set(ALL_VERSES.map((v) => v.id));
for (const row of PHALADIPIKA_26_ROWS) {
  if (!verseIds.has(row.verseId)) fail(`row points at a missing verse: ${row.verseId}`);
}

// 2. every verse has Devanagari mula
for (const v of ALL_VERSES) {
  if (!v.mula || !DEVANAGARI.test(v.mula)) fail(`verse ${v.id} has no Devanagari mūla`);
  if (!v.subject) fail(`verse ${v.id} has no subject`);
}

// 3. no duplicate (graha, bhava)
const seen = new Set<string>();
for (const row of PHALADIPIKA_26_ROWS) {
  const key = `${row.graha}:${row.bhava}`;
  if (seen.has(key)) fail(`duplicate phala row for ${key}`);
  seen.add(key);
  if (row.bhava < 1 || row.bhava > 12) fail(`row ${key} has a house outside 1–12`);
  if (!row.phala) fail(`row ${key} has no phala text`);
}

// 4. all twelve rāśis present
const rashis = new Set(PHALADIPIKA_09_RASHIS.map((r) => r.rashi));
for (let i = 1; i <= 12; i++) {
  if (!rashis.has(i as never)) fail(`no rāśi reading for rāśi ${i}`);
}
for (const r of PHALADIPIKA_09_RASHIS) {
  if (!verseIds.has(r.verseId)) fail(`rāśi ${r.rashi} points at a missing verse: ${r.verseId}`);
}

// 5. declared gaps
const DECLARED_GAPS = new Set(['moon:12', 'rahu:12']);
const grahas = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'] as const;
for (const g of grahas) {
  for (let h = 1; h <= 12; h++) {
    const key = `${g}:${h}`;
    if (!seen.has(key) && !DECLARED_GAPS.has(key)) {
      fail(`gochara gap not declared for ${key}`);
    }
  }
}

if (bad > 0) {
  console.log(`::error::${bad} corpus problem(s)`);
  process.exit(1);
}

console.log('::notice::phala corpus ok');
console.log(
  `verses: ${ALL_VERSES.length} | gochara rows: ${PHALADIPIKA_26_ROWS.length} | rāśi readings: ${PHALADIPIKA_09_RASHIS.length}`
);
