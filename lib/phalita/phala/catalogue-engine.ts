/**
 * PHALITA — evaluating the catalogue against a chart.
 *
 * Every question names the bhāvas that answer it. Each of those bhāvas is read
 * by the rule layer, which turns every condition of the text that applies into
 * a concrete sentence about this chart.
 *
 * The answer must answer the question ASKED. A question about interruption is
 * not answered by reciting what supports the house — so the question's own
 * framing decides which side of the evidence is reported, and an absent
 * negative is stated as an absent negative.
 *
 * The claim is one finding; the reason is the next one; the counter is the
 * strongest finding on the other side. No sentence is printed twice.
 *
 * The corroboration rule from Phaladīpikā 15.6 governs: a question the source
 * catalogue marks serious or fatal is withheld unless two conditions agree.
 */

import type { JyotishaChart } from '@/lib/jyotisha/types';
import type { Question, QFactor } from './questions';
import { DOMAINS, NOTES, QUESTIONS, ROWS } from './catalogue';
import { readBhavas } from './rules';

/** Question wording that asks about the adverse side of a matter. */
const NEGATIVE_FRAMING = /(interrupt|discontinu|loss|lose|lost|difficult|weak|risk|obstacle|delay|deni|conflict|fail|doubt|struggle|adverse|afflict|damage|break|obstruct|problem|concern|challenge|vulnerab|deficit|lack|absence|hardship|suffer|decline|setback|enemy|enemies|dispute|separation|illness|disease|danger|harm|stress|tension|burden|debt|anxiety|fear|worry|crisis|mishap|downfall|instability|friction|loss of)/i;

/**
 * Build catalogue answers.
 *
 * Pass `onlyDomain` to evaluate a single domain: the filter runs before any
 * rule is evaluated, so a domain page builds its ten answers rather than all
 * 250.
 */
export function buildCatalogue(chart: JyotishaChart, onlyDomain?: string): Question[] {
  const out: Question[] = [];

  ROWS.forEach((row, i) => {
    const [id, domIdx, noteIdx, bhavas, sev] = row;
    const question = QUESTIONS[i];
    const domain = DOMAINS[domIdx] ?? 'General';

    // Skip before doing any work: no reading, no scoring, no allocation.
    if (onlyDomain && domain !== onlyDomain) return;

    const note = NOTES[noteIdx] ?? '';

    const findings = readBhavas(chart, bhavas);
    const good = findings.filter((f) => f.side === 'a').sort((x, y) => y.weight - x.weight);
    const bad = findings.filter((f) => f.side === 'b').sort((x, y) => y.weight - x.weight);

    const pos = good.reduce((s, f) => s + f.weight, 0);
    const neg = bad.reduce((s, f) => s + f.weight, 0);
    const margin = Math.abs(pos - neg);
    const chartFavourable = pos > neg;

    const leading = chartFavourable ? good.length : bad.length;
    const serious = sev !== 'm';
    const thin = serious && leading < 2;

    // Which side the QUESTION is about, independent of which side the chart favours.
    const asksAboutAdverse = NEGATIVE_FRAMING.test(question);
    const reportAdverse = asksAboutAdverse;

    const side = reportAdverse ? bad : good;
    const other = reportAdverse ? good : bad;
    const sidePresent = side.length > 0 && side.reduce((s, f) => s + f.weight, 0) > 0;

    const claim = side.slice(0, 1).map((f) => f.predicts || f.text);
    const reason = side.slice(1, 2).map((f) => f.text);
    const counter = Array.from(new Set(other.slice(0, 1).map((f) => f.predicts || f.text)))
      .filter((t) => !claim.includes(t));
    const reasonClause = reason[0] ? ` — because ${noDot(reason[0])}.` : '';
    const claimText = claim.map((t) => cap(noDot(t))).join('; ');

    let answer: string;
    if (thin) {
      answer =
        'Not enough to call. Only one condition of the chart bears on this, and a question of this weight is not settled by a single placement — the engine withholds it rather than pronouncing it.';
    } else if (reportAdverse && !sidePresent) {
      // The question asks about a difficulty; the chart does not show one. Say so.
      answer =
        'Nothing of weight in this chart points to that. ' +
        (other[0] ? `${cap(noDot(other[0].predicts || other[0].text))} — and nothing material stands against it.` : 'The conditions this question asks about do not arise here.') +
        ' The question is asked in the negative; the chart answers it in the positive.';
    } else if (reportAdverse) {
      answer =
        `${claimText}.` + reasonClause +
        (counter[0] ? ` What still holds it up: ${noDot(counter[0])}.` : ' Nothing in the chart offsets it.');
    } else if (margin < 1.5) {
      answer = `Close to even. ${claim[0] ? cap(claim[0]) + '.' : ''} ${
        counter[0] ? 'But ' + counter[0] + '.' : ''
      } The chart does not settle it, so the outcome is more likely to be decided by circumstance than by the chart.`;
    } else if (chartFavourable) {
      answer =
        `${claimText}.` + reasonClause +
        (counter[0] ? ` What works against it: ${noDot(counter[0])}.` : ' Nothing of weight opposes it in this chart.');
    } else {
      answer =
        `${claimText}.` + reasonClause +
        (counter[0] ? ` What still holds it up: ${noDot(counter[0])}.` : ' Nothing in the chart offsets it.');
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

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/\.+$/, '');
