/**
 * PHALITA — evaluating the full catalogue against a chart.
 *
 * Each question names the bhāvas that answer it. This engine scores every one
 * of those bhāvas from the chart — its lord's dignity and placement, benefic
 * and malefic company, and the dṛṣṭi on it — and turns the total into a
 * verdict.
 *
 * The scoring is PHALITA's protocol, not a verse. What the texts give is the
 * hierarchy — a strong lord supports its bhāva, a malefic on it afflicts —
 * and these weights are one faithful way to compute it. They are published.
 *
 * The corroboration rule from Phaladīpikā 15.6 applies here too: a question
 * the source catalogue marks serious or fatal is not answered by one
 * placement.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import type { Question, QFactor } from './questions';
import { DOMAINS, NOTES, QUESTIONS, ROWS } from './catalogue';

const BEN: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MAL: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const DUS = [6, 8, 12];

const dig = (d: string) =>
  d === 'Exalted (Ucca)' ? 3
  : d === 'Moolatrikona' ? 2.5
  : d === 'Own Sign (Swakshetra)' ? 2
  : d.startsWith('Great Friend') ? 1.2
  : d.startsWith('Friend') ? 1
  : d === 'Neutral (Sama)' ? 0
  : d.startsWith('Great Enemy') ? -1.5
  : d.startsWith('Enemy') ? -1
  : -2.5;

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export function buildCatalogue(chart: JyotishaChart): Question[] {
  const out: Question[] = [];
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;

  ROWS.forEach((row, i) => {
    const [id, domIdx, noteIdx, bhavas, sev] = row;
    const question = QUESTIONS[i];
    const domain = DOMAINS[domIdx] ?? 'General';
    const note = NOTES[noteIdx] ?? '';

    let pos = 0;
    let neg = 0;
    let posN = 0;
    let negN = 0;
    const factors: QFactor[] = [];

    for (const h of bhavas) {
      const house = chart.bhavas[h - 1];
      if (!house) continue;
      const lord = house.rashiLord as PlanetId;
      const p = chart.planets[lord];
      const occ = (house.planetsInHouse ?? []) as PlanetId[];

      if (p) {
        const d = dig(p.dignity);
        if (d > 0) {
          pos += d; posN += 1;
          factors.push({ label: `lord of ${ORD[h]} in ${p.dignity} — the bhāva is supported`, side: 'a', weight: Math.round(d * 10) / 10, ground: 'Phaladīpikā 15.1–7, bhāva supported by a strong lord' });
        } else if (d < 0) {
          neg += -d; negN += 1;
          factors.push({ label: `lord of ${ORD[h]} in ${p.dignity} — the bhāva is weakened`, side: 'b', weight: Math.round(-d * 10) / 10, ground: 'Phaladīpikā 15.1–7' });
        }
        if (DUS.includes(p.house)) {
          neg += 1.2; negN += 1;
          factors.push({ label: `lord of ${ORD[h]} fallen into the ${ORD[p.house]} — its matter is obstructed`, side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.19' });
        }
        if (p.isCombust) {
          neg += 0.8; negN += 1;
          factors.push({ label: `lord of ${ORD[h]} is combust — its rays are lost`, side: 'b', weight: 0.8, ground: 'Phaladīpikā 15.9' });
        }
      }

      const bIn = occ.filter((o) => BEN.includes(o));
      const mIn = occ.filter((o) => MAL.includes(o));
      if (bIn.length) {
        pos += 1; posN += 1;
        factors.push({ label: `benefic company in the ${ORD[h]}`, side: 'a', weight: 1, ground: 'Phaladīpikā 15.1' });
      }
      if (mIn.length) {
        neg += 1; negN += 1;
        factors.push({ label: `malefic company in the ${ORD[h]}`, side: 'b', weight: 1, ground: 'Phaladīpikā 15.1' });
      }

      const bAsp = BEN.some((b) => (chart.planets[b].aspectsToHouses ?? []).includes(h));
      const mAsp = MAL.some((m) => (chart.planets[m].aspectsToHouses ?? []).includes(h));
      if (bAsp) {
        pos += 1.2; posN += 1;
        factors.push({ label: `benefic dṛṣṭi on the ${ORD[h]}`, side: 'a', weight: 1.2, ground: 'Phaladīpikā 15.1' });
      }
      if (mAsp) {
        neg += 1.2; negN += 1;
        factors.push({ label: `malefic dṛṣṭi on the ${ORD[h]}`, side: 'b', weight: 1.2, ground: 'Phaladīpikā 15.1' });
      }
    }

    // ṣaḍbala on the first bhāva lord, as a tie-breaker.
    const firstLord = chart.bhavas[(bhavas[0] ?? 1) - 1]?.rashiLord as PlanetId | undefined;
    if (firstLord && sb[firstLord]?.totalVirupas) {
      const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      const vals = seven.map((g) => sb[g]?.totalVirupas ?? 0).filter((v) => v > 0);
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const mine = sb[firstLord]?.totalVirupas ?? 0;
      if (mean > 0) {
        const delta = Math.round(((mine - mean) / mean) * 60);
        if (delta >= 8) { pos += 1; posN += 1; }
        else if (delta <= -8) { neg += 1; negN += 1; }
      }
    }

    const margin = Math.abs(pos - neg);
    const leading = pos >= neg ? posN : negN;
    const serious = sev !== 'm';
    const thin = serious && leading < 2;

    const favourable = pos > neg;
    const answer = thin
      ? 'Not enough to call. One placement points one way and nothing else in the chart corroborates it. A question of this weight is not settled by a single condition, so the engine withholds it.'
      : margin < 1
      ? 'Mixed. The chart reads close to evenly here, so the outcome is more likely to be decided by circumstance than by the chart.'
      : favourable
      ? 'The chart supports this. The bhāvas that govern it are well held, and what afflicts them is outweighed.'
      : 'The chart puts this under strain. The bhāvas that govern it are afflicted, and what supports them does not outweigh it.';

    out.push({
      id,
      domain,
      question,
      a: 'Supported',
      b: 'Under strain',
      aScore: Math.round(pos * 10) / 10,
      bScore: Math.round(neg * 10) / 10,
      answer,
      confidence: thin || margin < 1 ? 'mixed' : margin < 3 ? 'leaning' : 'clear',
      factors: factors.slice(0, 8),
      caveat:
        (note ? note + ' ' : '') +
        'Read from the bhāvas the question names, using Phaladīpikā 15.6: a serious or fatal reading needs more than one condition. The scoring is PHALITA’s protocol, published so it can be argued with.',
    });
  });

  return out;
}
