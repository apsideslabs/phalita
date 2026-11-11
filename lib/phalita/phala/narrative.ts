/**
 * PHALITA — the narrative reading.
 *
 * A person does not want 250 answers, and they do not want ten paragraphs of
 * prose either. Each chapter returns structure: a lead sentence, short lines for
 * what the chart gives and what it costs, the period it is active in, and one
 * closing sentence.
 *
 * Nothing is invented here — the lines are the same findings the rule layer
 * produced, split so the eye can scan them.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { parseDashaDate } from '@/lib/dashas/vimshottari';
import { readBhava, readBhavas } from './rules';
import { careerMode, marriageMode } from './answers';

export interface Chapter {
  id: string;
  title: string;
  strap: string;
  emoji: string;
  standing: 'strong' | 'mixed' | 'strained';
  lead: string;
  gives: string[];
  costs: string[];
  when: string | null;
  advice: string;
}

interface Voice {
  strong: string;
  mixed: string;
  strained: string;
}

interface Sector {
  id: string;
  title: string;
  strap: string;
  emoji: string;
  bhavas: number[];
  open: Voice;
  close: Voice;
}

const SECTORS: Sector[] = [
  {
    id: 'career', title: 'Work and standing', strap: 'the tenth, sixth and eleventh', emoji: '🧭', bhavas: [10, 6, 11],
    open: {
      strong: 'Work is where this chart is strongest. What you do in public is what you are known for, and it is where the money and the reputation come from.',
      mixed: 'Work gives real capacity and real obstruction in the same place, so the outcome depends more on where you put the effort than on what you are given.',
      strained: 'Work is the hardest part of this chart. Advancement comes late and unevenly, and recognition tends to arrive after the effort that earned it.',
    },
    close: {
      strong: 'Stay in public work, keep your name attached to what you build, and do not retreat into a back room.',
      mixed: 'Keep a visible thread through the changes; that is what decides this, not the chart.',
      strained: 'Expect the first decade to be slower than your ability deserves. The chart rewards patience here more than ambition.',
    },
  },
  {
    id: 'money', title: 'Money', strap: 'the second and eleventh', emoji: '💰', bhavas: [2, 11],
    open: {
      strong: 'Money is one of the well-placed parts of this chart. It accumulates, and it accumulates from things you already hold rather than from windfalls.',
      mixed: 'Money arrives and money leaves here, and the two are not always in the same season. The chart gives earning capacity and a leak, and both are real.',
      strained: 'Money is tight in this chart. Income stays below what the effort deserves, and there is little inherited cushion to absorb a bad year.',
    },
    close: {
      strong: 'Build slowly and keep what you build. This is not a chart that rewards a big bet.',
      mixed: 'Earning will not be the problem; keeping will be. Separate what comes in from what is available to spend.',
      strained: 'Plan for lean periods rather than being surprised by them, and avoid borrowing against future income.',
    },
  },
  {
    id: 'marriage', title: 'Marriage and partnership', strap: 'the seventh and second', emoji: '💍', bhavas: [7, 2],
    open: {
      strong: 'Partnership is well held in this chart. A bond formed here tends to settle and stay settled, and the other person adds to what you build rather than dividing it.',
      mixed: 'Marriage is neither promised nor refused in this chart. It gives conditions that pull both ways, and the outcome follows the choice more than the chart.',
      strained: 'Partnership is the sector under the most pressure here. Delay, strain, or a bond that costs more than it returns — the chart names the difficulty rather than hiding it.',
    },
    close: {
      strong: 'Marry for the partnership, not the arrangement, and give it the years it needs.',
      mixed: 'Choose deliberately rather than by default; nothing here settles it for you.',
      strained: 'The chart does not say the marriage fails. It says it will need more attention than it gets by itself — and that patience here is repaid.',
    },
  },
  {
    id: 'children', title: 'Children and creative work', strap: 'the fifth and ninth', emoji: '🌱', bhavas: [5, 9],
    open: {
      strong: 'This is a fertile part of the chart — children, students, and the work you make rather than the work you do.',
      mixed: 'Children and creative work come, but not easily and not early. The chart gives the thing and delays it.',
      strained: 'Children are a source of difficulty here, or arrive late, or do not arrive. The chart says so plainly, and it is not the whole of the fifth house.',
    },
    close: {
      strong: 'Whatever you make with your hands and teach to someone else is supported here.',
      mixed: 'What you build in this area will outlast you; what you expect on a timetable may not.',
      strained: 'If children do not come, the same house governs what you create and who you teach. A different door, not a closed one.',
    },
  },
  {
    id: 'home', title: 'Home and property', strap: 'the fourth', emoji: '🏠', bhavas: [4],
    open: {
      strong: 'Home is solidly held. Property, vehicles and domestic peace accumulate, and the family house becomes a base rather than a burden.',
      mixed: 'Home is unsettled — the chart gives property and takes peace, or gives peace and delays property.',
      strained: 'Home is a difficult house here. Property is lost, delayed or damaged, and domestic peace has to be built rather than inherited.',
    },
    close: {
      strong: 'Root yourself where you are; this chart rewards staying put.',
      mixed: 'Buy later rather than sooner, and do not confuse a house with a home.',
      strained: 'Expect to build your own ground. What you make will be more secure than what you are given.',
    },
  },
  {
    id: 'body', title: 'Body and health', strap: 'the first and sixth', emoji: '🫀', bhavas: [1, 6],
    open: {
      strong: 'The body is well held. Constitution is sound, recovery is quick, and illness does not take root.',
      mixed: 'The body gives and takes. There is strength to draw on and a recurring weak point that will not resolve on its own.',
      strained: 'The body is the sector that asks most. Vitality runs below your apparent strength, and energy has to be managed rather than spent.',
    },
    close: {
      strong: 'Nothing here shortens life. Keep the ordinary disciplines and the chart holds.',
      mixed: 'Treat the recurring thing early rather than late; that is the whole of the advice.',
      strained: 'Rest is not optional for this chart. Managed, it runs long; unmanaged, it does not.',
    },
  },
  {
    id: 'mind', title: 'Mind and temperament', strap: 'the first, fourth and fifth', emoji: '🧠', bhavas: [1, 4, 5],
    open: {
      strong: 'The mind is steady here — you think clearly under pressure and people come to you when things are uncertain.',
      mixed: 'The mind is quick and unsettled in equal measure. Ideas come easily and staying with one is harder.',
      strained: 'The mind carries more weight than the body does. Restlessness, worry, and a tendency to think past the point where thinking helps.',
    },
    close: {
      strong: 'Trust your judgement; it is one of the better things in this chart.',
      mixed: 'Finish things deliberately rather than relying on enthusiasm to carry you.',
      strained: 'Give the mind something steady to hold — routine, a discipline, a person — and it settles.',
    },
  },
  {
    id: 'fortune', title: 'Fortune and support', strap: 'the ninth and eleventh', emoji: '🍀', bhavas: [9, 11],
    open: {
      strong: 'Help arrives in this chart, and it arrives from above — teachers, elders, people with more standing than you.',
      mixed: 'Fortune is uneven. Some doors open without effort and others stay shut no matter how hard they are pushed.',
      strained: 'Fortune is thin here. What you get, you get by your own effort; the helping hand is late or absent.',
    },
    close: {
      strong: 'Ask for help. This chart rewards the person who does.',
      mixed: 'Do not read a closed door as a verdict; read it as a direction.',
      strained: 'Build your own network early, because the inherited one will not carry you.',
    },
  },
  {
    id: 'family', title: 'Family and siblings', strap: 'the third and fourth', emoji: '👪', bhavas: [3, 4],
    open: {
      strong: 'Family holds together here. Siblings are an asset and the household you come from steadies you.',
      mixed: 'Family gives with one hand. There is support and there is friction, and both come from the same people.',
      strained: 'Family is a point of loss rather than support. Siblings are distant, or the household you come from does not back you.',
    },
    close: {
      strong: 'Keep the ties; they are one of the better parts of this chart.',
      mixed: 'Keep the people and drop the expectation that they will change.',
      strained: 'Do not wait for the family to become what it is not. Build the household you want.',
    },
  },
  {
    id: 'spirit', title: 'Dharma and inward life', strap: 'the ninth and twelfth', emoji: '🕉', bhavas: [9, 12],
    open: {
      strong: 'There is a real inward pull in this chart — an interest in what lies behind things, and a capacity to be alone with it.',
      mixed: 'The inward life is present but not dominant. It shows up in seasons rather than as a constant.',
      strained: 'The inward life is a place of loss here rather than gain — retreat costs you, and solitude is not restful.',
    },
    close: {
      strong: 'Whatever practice you take up will hold. Take one up.',
      mixed: 'Let it be seasonal; forcing it does not help.',
      strained: 'Find your steadiness in people and work rather than in solitude.',
    },
  },
];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/\.+$/, '');

/** Split a prediction into its sentences, so each becomes a scannable line. */
function lines(predicts: (string | undefined)[]): string[] {
  const out: string[] = [];
  for (const p of predicts) {
    if (!p) continue;
    for (const part of noDot(p).split(/(?<=\.)\s+/)) {
      const t = part.trim();
      if (t && !out.includes(t)) out.push(cap(t));
    }
  }
  return out.slice(0, 3);
}

function periodFor(chart: JyotishaChart, bhava: number): string | null {
  const lord = chart.bhavas[bhava - 1]?.rashiLord as PlanetId | undefined;
  if (!lord) return null;
  const tree = (chart.vimshottari as unknown as { tree?: unknown[] })?.tree ?? [];
  if (!tree.length) return null;
  const hit = tree.find((d) => (d as { lord?: string })?.lord === lord) as
    | { startDate?: string; endDate?: string }
    | undefined;
  if (!hit || !hit.startDate || !hit.endDate) return null;
  try {
    const from = new Date(parseDashaDate(hit.startDate)).getFullYear();
    const to = new Date(parseDashaDate(hit.endDate)).getFullYear();
    const name = GRAHA_PROPERTIES[lord]?.name ?? lord;
    return `${name} period, ${from} – ${to}`;
  } catch {
    return null;
  }
}

export function buildNarrative(chart: JyotishaChart): Chapter[] {
  return SECTORS.map((s) => {
    const own = readBhava(chart, s.bhavas[0]);
    const all = readBhavas(chart, s.bhavas);
    const findings = own.length ? own : all;

    const good = findings.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight);
    const bad = findings.filter((f) => f.side === 'b').sort((a, b) => b.weight - a.weight);
    const pos = good.reduce((x, f) => x + f.weight, 0);
    const neg = bad.reduce((x, f) => x + f.weight, 0);
    const standing: Chapter['standing'] =
      pos > neg * 1.25 ? 'strong' : neg > pos * 1.25 ? 'strained' : 'mixed';

    const gives = lines(good.map((f) => f.predicts));
    const costs = lines(bad.map((f) => f.predicts));

    // The weighed question that belongs to this sector, where there is one.
    if (s.id === 'career') {
      const a = careerMode(chart);
      if (a.answer) gives.unshift(a.answer);
    }
    if (s.id === 'marriage') {
      const a = marriageMode(chart);
      if (a.answer) gives.unshift(a.answer);
    }

    return {
      id: s.id,
      title: s.title,
      strap: s.strap,
      emoji: s.emoji,
      standing,
      lead: s.open[standing],
      gives: gives.slice(0, 4),
      costs: costs.slice(0, 3),
      when: periodFor(chart, s.bhavas[0]),
      advice: s.close[standing],
    };
  });
}
