/**
 * PHALITA — the narrative reading.
 *
 * A person does not want 250 answers. They want to be told, in order, what
 * their life looks like: work, money, marriage, body, mind, fortune. This
 * module takes the findings the rule layer produced and writes them as prose —
 * a paragraph per sector, the way an astrologer would speak it.
 *
 * The evidence is woven into the sentence, not listed after it.
 */

import type { JyotishaChart } from '@/lib/jyotisha/types';
import { readBhava, readBhavas } from './rules';
import { careerMode, marriageMode } from './answers';

export interface Chapter {
  id: string;
  title: string;
  /** One line under the heading — the sector in a phrase. */
  strap: string;
  /** The reading itself, one paragraph per entry. */
  paragraphs: string[];
  /** 'strong' | 'mixed' | 'strained' — used only for the quiet marker. */
  standing: 'strong' | 'mixed' | 'strained';
}

interface Sector {
  id: string;
  title: string;
  strap: string;
  bhavas: number[];
  /** What this sector is about, for the closing sentence. */
  concern: string;
}

const SECTORS: Sector[] = [
  { id: 'career', title: 'Work and standing', strap: 'the tenth, sixth and eleventh', bhavas: [10, 6, 11], concern: 'what you do for a living and what it earns you in standing' },
  { id: 'money', title: 'Money', strap: 'the second and eleventh', bhavas: [2, 11], concern: 'what comes in, what stays, and what it costs' },
  { id: 'marriage', title: 'Marriage and partnership', strap: 'the seventh and second', bhavas: [7, 2], concern: 'the bond you build with another person' },
  { id: 'children', title: 'Children and creative work', strap: 'the fifth and ninth', bhavas: [5, 9], concern: 'what you bring into the world and pass on' },
  { id: 'home', title: 'Home and property', strap: 'the fourth', bhavas: [4], concern: 'the ground you stand on and the roof over it' },
  { id: 'body', title: 'Body and health', strap: 'the first and sixth', bhavas: [1, 6], concern: 'the body you carry through all of it' },
  { id: 'mind', title: 'Mind and temperament', strap: 'the first, fourth and fifth', bhavas: [1, 4, 5], concern: 'how you think, and what steadies you' },
  { id: 'fortune', title: 'Fortune and support', strap: 'the ninth and eleventh', bhavas: [9, 11], concern: 'help that arrives from outside your own effort' },
  { id: 'family', title: 'Family and siblings', strap: 'the third and fourth', bhavas: [3, 4], concern: 'the people you came from' },
  { id: 'spirit', title: 'Dharma and inward life', strap: 'the ninth and twelfth', bhavas: [9, 12], concern: 'what you are doing it all for' },
];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/\.+$/, '');

/** Joins clauses into a sentence with a colon-free, human rhythm. */
const sentence = (parts: string[]) => parts.filter(Boolean).join(' ');

export function buildNarrative(chart: JyotishaChart): Chapter[] {
  return SECTORS.map((s) => {
    // The chapter leads from its own bhāva. The other bhāvas in the sector are
    // supporting evidence, not the subject — a marriage reading that opens with
    // the wealth lord is a reading that has lost its thread.
    const primary = s.bhavas[0];
    const own = readBhava(chart, primary);
    const all = readBhavas(chart, s.bhavas);
    const findings = own.length ? own : all;
    const support = all.filter((f) => !findings.some((g) => g.text === f.text));

    const good = findings.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight);
    const bad = findings.filter((f) => f.side === 'b').sort((a, b) => b.weight - a.weight);
    const pos = good.reduce((x, f) => x + f.weight, 0);
    const neg = bad.reduce((x, f) => x + f.weight, 0);
    const standing: Chapter['standing'] = pos > neg * 1.25 ? 'strong' : neg > pos * 1.25 ? 'strained' : 'mixed';

    const paragraphs: string[] = [];

    // 1. The opening — what the sector is and where it stands.
    const opening =
      standing === 'strong'
        ? `On ${s.concern}, this chart is well placed.`
        : standing === 'strained'
        ? `On ${s.concern}, the chart is under real pressure.`
        : `On ${s.concern}, the chart gives a mixed account — some of it holds, some of it does not.`;
    paragraphs.push(opening);

    // 2. The body of the reading — the strongest findings, in prose.
    const lead = good.slice(0, 2);
    const drag = bad.slice(0, 2);

    if (lead.length) {
      const preds = Array.from(new Set(lead.map((f) => noDot(f.predicts || '')))).filter(Boolean);
      const why = lead[0] ? noDot(lead[0].text) : '';
      const body = preds.length ? `${cap(preds.join('. '))}.` : '';
      const reason = why ? `The chart says so because ${why}.` : '';
      paragraphs.push(sentence([body, reason]));
    }

    // Supporting evidence from the sector's other bhāvas, where it adds.
    const suppGood = support.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight).slice(0, 1);
    if (suppGood.length && lead.length) {
      paragraphs.push(`There is support from a second quarter: ${noDot(suppGood[0].text)}.`);
    }

    if (drag.length) {
      const preds = Array.from(new Set(drag.map((f) => noDot(f.predicts || '')))).filter(Boolean);
      const why = drag[0] ? noDot(drag[0].text) : '';
      const body = preds.length ? `${cap(preds.join('. '))}.` : '';
      const reason = why ? `Behind that: ${why}.` : '';
      paragraphs.push(sentence([body, reason]));
    }

    // 3. The weighed question that belongs to this sector, where there is one.
    if (s.id === 'career') paragraphs.push(careerMode(chart).answer);
    if (s.id === 'marriage') paragraphs.push(marriageMode(chart).answer);

    // 4. What it adds up to.
    const close =
      standing === 'strong'
        ? `Taken together, this is one of the parts of the chart you can lean on.`
        : standing === 'strained'
        ? `Taken together, this is the part of the chart that asks the most of you, and where effort returns least on its own.`
        : `Taken together, neither side wins here — this sector will follow the choices you make more than the chart's promise.`;
    paragraphs.push(close);

    return {
      id: s.id,
      title: s.title,
      strap: s.strap,
      paragraphs: paragraphs.filter((p) => p && p.trim().length > 0),
      standing,
    };
  });
}
