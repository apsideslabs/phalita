/**
 * PHALITA — evaluating the full catalogue against a chart.
 *
 * Every question names the bhāvas that answer it. Each of those bhāvas is read
 * by the rule layer, which turns every condition of the text that applies into
 * a concrete sentence about this chart — the planet, its sign, its house, and
 * what that means for the matter in question.
 *
 * The answer is then written from those sentences: the two strongest findings
 * for the leading side, and the strongest against it. Not "supported by verse
 * 15.1" — the verse is provenance, the sentence is the reading.
 *
 * The corroboration rule from Phaladīpikā 15.6 governs: a question the source
 * catalogue marks serious or fatal is withheld unless two conditions agree.
 */

import type { JyotishaChart } from '@/lib/jyotisha/types';
import type { Question, QFactor } from './questions';
import { DOMAINS, NOTES, QUESTIONS, ROWS } from './catalogue';
import { readBhavas } from './rules';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function buildCatalogue(chart: JyotishaChart): Question[] {
  const out: Question[] = [];

  ROWS.forEach((row, i) => {
    const [id, domIdx, noteIdx, bhavas, sev] = row;
    const question = QUESTIONS[i];
    const domain = DOMAINS[domIdx] ?? 'General';
    const note = NOTES[noteIdx] ?? '';

    const findings = readBhavas(chart, bhavas);
    const good = findings.filter((f) => f.side === 'a').sort((x, y) => y.weight - x.weight);
    const bad = findings.filter((f) => f.side === 'b').sort((x, y) => y.weight - x.weight);

    const pos = good.reduce((s, f) => s + f.weight, 0);
    const neg = bad.reduce((s, f) => s + f.weight, 0);
    const margin = Math.abs(pos - neg);
    const favourable = pos > neg;

    const leading = favourable ? good.length : bad.length;
    const serious = sev !== 'm';
    const thin = serious && leading < 2;

    // The answer is built from the findings themselves.
    const lead = (favourable ? good : bad).slice(0, 2).map((f) => f.text);
    const counter = (favourable ? bad : good).slice(0, 1).map((f) => f.text);

    let answer: string;
    if (thin) {
      answer =
        'Not enough to call. Only one condition of the chart bears on this, and a question of this weight is not settled by a single placement — the engine withholds it rather than pronouncing it.';
    } else if (margin < 1.5) {
      answer = `Close to even. ${lead[0] ? cap(lead[0]) + '.' : ''} ${
        counter[0] ? 'But ' + counter[0] + '.' : ''
      } The chart does not settle it, so the outcome is more likely to be decided by circumstance than by the chart.`;
    } else if (favourable) {
      answer =
        `${lead.map((t) => cap(t)).join('. ')}.` +
        (counter[0] ? ` What works against it: ${counter[0]}.` : ' Nothing of weight opposes it in this chart.');
    } else {
      answer =
        `${lead.map((t) => cap(t)).join('. ')}.` +
        (counter[0] ? ` What still holds it up: ${counter[0]}.` : ' Nothing in the chart offsets it.');
    }

    const factors: QFactor[] = [...good.slice(0, 4), ...bad.slice(0, 4)].map((f) => ({
      label: f.text,
      side: f.side,
      weight: Math.round(f.weight * 10) / 10,
      ground: f.ground,
    }));

    out.push({
      id,
      domain,
      question,
      a: 'Supported',
      b: 'Under strain',
      aScore: Math.round(pos * 10) / 10,
      bScore: Math.round(neg * 10) / 10,
      answer,
      confidence: thin || margin < 1.5 ? 'mixed' : margin < 3 ? 'leaning' : 'clear',
      factors,
      caveat:
        (note ? note + ' ' : '') +
        'Each line is a condition of Phaladīpikā tested against this chart; the verse is cited beside it. A serious or fatal reading needs two conditions to agree (15.6), and the scoring weights are PHALITA’s protocol, published so they can be argued with.',
    });
  });

  return out;
}
