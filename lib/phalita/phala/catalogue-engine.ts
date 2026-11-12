/**
 * PHALITA — evaluating the catalogue against a chart.
 *
 * The answer must answer the question ASKED and must report what the chart
 * actually weighs.
 *
 *   negative question  → the adverse side if it exists; if not, say plainly
 *                        that the chart does not show it
 *   positive question  → the DOMINANT side, whichever it is
 *
 * Within the reported side, findings carrying a verse's phala come first, so
 * the claim is an outcome rather than a description of a placement.
 */

import type { JyotishaChart } from '@/lib/jyotisha/types';
import type { Question, QFactor } from './questions';
import { DOMAINS, NOTES, QUESTIONS, ROWS } from './catalogue';
import { readBhavas } from './rules';

const NEGATIVE_FRAMING = /(interrupt|discontinu|loss|lose|lost|difficult|weak|risk|obstacle|delay|deni|conflict|fail|doubt|struggle|adverse|afflict|damage|break|obstruct|problem|concern|challenge|vulnerab|deficit|lack|absence|hardship|suffer|decline|setback|enemy|enemies|dispute|separation|illness|disease|danger|harm|stress|tension|burden|debt|anxiety|fear|worry|crisis|mishap|downfall|instability|friction|loss of)/i;

/** Findings that state a verse's phala lead; the rest are evidence. */
const byPhalaThenWeight = (a: { predicts?: string; weight: number }, b: { predicts?: string; weight: number }) =>
  (b.predicts ? 1 : 0) - (a.predicts ? 1 : 0) || b.weight - a.weight;

export function buildCatalogue(chart: JyotishaChart, onlyDomain?: string): Question[] {
  const out: Question[] = [];

  ROWS.forEach((row, i) => {
    const [id, domIdx, noteIdx, bhavas, sev] = row;
    const question = QUESTIONS[i];
    const domain = DOMAINS[domIdx] ?? 'General';

    if (onlyDomain && domain !== onlyDomain) return;

    const note = NOTES[noteIdx] ?? '';

    const findings = readBhavas(chart, bhavas);
    const good = findings.filter((f) => f.side === 'a').sort(byPhalaThenWeight);
    const bad = findings.filter((f) => f.side === 'b').sort(byPhalaThenWeight);

    const pos = good.reduce((s, f) => s + f.weight, 0);
    const neg = bad.reduce((s, f) => s + f.weight, 0);
    const margin = Math.abs(pos - neg);
    const chartFavourable = pos > neg;

    const leading = chartFavourable ? good.length : bad.length;
    const serious = sev !== 'm';
    const thin = serious && leading < 2;

    const reportAdverse = NEGATIVE_FRAMING.test(question);
    // A positive question reports whichever side the chart actually weighs.
    const side = reportAdverse ? bad : (chartFavourable ? good : bad);
    const other = reportAdverse ? good : (chartFavourable ? bad : good);
    const sidePresent = side.length > 0 && side.reduce((s, f) => s + f.weight, 0) > 0;

    const claim = side.slice(0, 1).map((f) => f.predicts || f.text);
    const reason = side.slice(1, 2).map((f) => f.text);
    const counter = Array.from(new Set(other.slice(0, 1).map((f) => f.predicts || f.text)))
      .filter((t) => !claim.includes(t));
    const reasonClause = reason[0] ? ` — because ${noDot(lc(reason[0]))}.` : '';
    const claimText = claim.map((t) => cap(noDot(t))).join('; ');

    let answer: string;
    if (thin) {
      answer =
        'Not enough to call. Only one condition of the chart bears on this, and a question of this weight is not settled by a single placement — the engine withholds it rather than pronouncing it.';
    } else if (reportAdverse && !sidePresent) {
      answer =
        'Nothing of weight in this chart points to that. ' +
        (other[0] ? `${cap(noDot(other[0].predicts || other[0].text))} — and nothing material stands against it.` : 'The conditions this question asks about do not arise here.') +
        ' The question is asked in the negative; the chart answers it in the positive.';
    } else if (margin < 1.5) {
      answer = `Close to even. ${claim[0] ? cap(claim[0]) + '.' : ''} ${
        counter[0] ? 'But ' + counter[0] + '.' : ''
      } The chart does not settle it, so the outcome is more likely to be decided by circumstance than by the chart.`;
    } else if (chartFavourable === !reportAdverse) {
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
const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/\.+$/, '');
