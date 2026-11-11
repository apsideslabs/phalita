/**
 * PHALITA — the narrative reading.
 *
 * A person does not want 250 answers. They want to be told, in order, what their
 * life looks like. This module writes the findings as prose — a chapter per
 * sector, in a voice of its own, the way an astrologer would speak it.
 *
 * No scaffolding in the text: no "the chart says so because", no "taken
 * together". The evidence is in the verse sections; the reading says what
 * happens, and when.
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
  paragraphs: string[];
  standing: 'strong' | 'mixed' | 'strained';
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
  bhavas: number[];
  open: Voice;
  turn: Voice;
  close: Voice;
}

const SECTORS: Sector[] = [
  {
    id: 'career', title: 'Work and standing', strap: 'the tenth, sixth and eleventh', bhavas: [10, 6, 11],
    open: {
      strong: 'Work is where this chart is strongest. What you do in public is what you are known for, and it is where the money and the reputation come from.',
      mixed: 'Work is a mixed picture here — the chart gives real capacity and real obstruction in the same place, so the outcome depends more on where you put the effort than on what you are given.',
      strained: 'Work is the hardest part of this chart. Advancement comes late and unevenly, and recognition tends to arrive after the effort that earned it.',
    },
    turn: { strong: 'It is not without cost.', mixed: 'There is a counterweight.', strained: 'There is something to build on, though.' },
    close: {
      strong: 'The advice is simple: stay in public work, keep your name attached to what you build, and do not retreat into a back room.',
      mixed: 'Nothing here decides the question for you. What decides it is whether you keep a visible thread through the changes.',
      strained: 'Expect the first decade to be slower than your ability deserves. The chart rewards patience here more than it rewards ambition.',
    },
  },
  {
    id: 'money', title: 'Money', strap: 'the second and eleventh', bhavas: [2, 11],
    open: {
      strong: 'Money is one of the well-placed parts of this chart. It accumulates, and it accumulates from things you already hold rather than from windfalls.',
      mixed: 'Money arrives and money leaves here, and the two are not always in the same season. The chart gives earning capacity and a leak, and both are real.',
      strained: 'Money is tight in this chart. Income stays below what the effort deserves, and there is little inherited cushion to absorb a bad year.',
    },
    turn: { strong: 'The leak is worth naming anyway.', mixed: 'The leak is the thing to watch.', strained: 'What helps is that the leak is knowable rather than random.' },
    close: {
      strong: 'Build slowly and keep what you build. This is not a chart that rewards a big bet.',
      mixed: 'Earning will not be the problem; keeping will be. Separate what comes in from what is available to spend.',
      strained: 'Plan for lean periods rather than being surprised by them, and avoid borrowing against future income.',
    },
  },
  {
    id: 'marriage', title: 'Marriage and partnership', strap: 'the seventh and second', bhavas: [7, 2],
    open: {
      strong: 'Partnership is well held in this chart. A bond formed here tends to settle and stay settled, and the other person adds to what you build rather than dividing it.',
      mixed: 'Marriage is neither promised nor refused in this chart. It gives conditions that pull both ways, and the outcome follows the choice more than the chart.',
      strained: 'Partnership is the sector under the most pressure here. Delay, strain, or a bond that costs more than it returns — the chart names the difficulty rather than hiding it.',
    },
    turn: { strong: 'What works against it is worth knowing.', mixed: 'The pull is not one-sided.', strained: 'None of that makes a good marriage impossible.' },
    close: {
      strong: 'Marry for the partnership, not the arrangement, and give it the years it needs.',
      mixed: 'Nothing here settles it for you. What settles it is choosing deliberately rather than by default.',
      strained: 'The chart does not say the marriage fails. It says it will need more attention than it gets by itself — and that patience here is repaid.',
    },
  },
  {
    id: 'children', title: 'Children and creative work', strap: 'the fifth and ninth', bhavas: [5, 9],
    open: {
      strong: 'This is a fertile part of the chart — children, students, and the work you make rather than the work you do.',
      mixed: 'Children and creative work come, but not easily and not early. The chart gives the thing and delays it.',
      strained: 'Children are a source of difficulty here, or arrive late, or do not arrive. The chart says so plainly, and it is not the whole of the fifth house.',
    },
    turn: { strong: 'It is not unqualified.', mixed: 'The delay is the point.', strained: 'The fifth house is not only children.' },
    close: {
      strong: 'Whatever you make with your hands and teach to someone else is supported here.',
      mixed: 'What you build in this area will outlast you; what you expect on a timetable may not.',
      strained: 'If children do not come, the same house governs what you create and who you teach. It is not a closed door, only a different one.',
    },
  },
  {
    id: 'home', title: 'Home and property', strap: 'the fourth', bhavas: [4],
    open: {
      strong: 'Home is solidly held. Property, vehicles and domestic peace accumulate, and the family house becomes a base rather than a burden.',
      mixed: 'Home is unsettled — the chart gives property and takes peace, or gives peace and delays property.',
      strained: 'Home is a difficult house here. Property is lost, delayed or damaged, and domestic peace has to be built rather than inherited.',
    },
    turn: { strong: 'The caveat is small.', mixed: 'Which one you get is worth knowing.', strained: 'What steadies it is your own effort, not inheritance.' },
    close: {
      strong: 'Root yourself where you are; this chart rewards staying put.',
      mixed: 'Buy later rather than sooner, and do not confuse a house with a home.',
      strained: 'Expect to build your own ground. What you make will be more secure than what you are given.',
    },
  },
  {
    id: 'body', title: 'Body and health', strap: 'the first and sixth', bhavas: [1, 6],
    open: {
      strong: 'The body is well held. Constitution is sound, recovery is quick, and illness does not take root.',
      mixed: 'The body gives and takes. There is strength to draw on and a recurring weak point that will not resolve on its own.',
      strained: 'The body is the sector that asks most. Vitality runs below your apparent strength, and energy has to be managed rather than spent.',
    },
    turn: { strong: 'Small things are worth attention.', mixed: 'The weak point is knowable.', strained: 'What helps is that the pattern is steady rather than sudden.' },
    close: {
      strong: 'Nothing here shortens life. Keep the ordinary disciplines and the chart holds.',
      mixed: 'Treat the recurring thing early rather than late; that is the whole of the advice.',
      strained: 'Rest is not optional for this chart. Managed, it runs long; unmanaged, it does not.',
    },
  },
  {
    id: 'mind', title: 'Mind and temperament', strap: 'the first, fourth and fifth', bhavas: [1, 4, 5],
    open: {
      strong: 'The mind is steady here — you think clearly under pressure and people come to you when things are uncertain.',
      mixed: 'The mind is quick and unsettled in equal measure. Ideas come easily and staying with one is harder.',
      strained: 'The mind carries more weight than the body does. Restlessness, worry, and a tendency to think past the point where thinking helps.',
    },
    turn: { strong: 'It is not effortless.', mixed: 'That is not a flaw.', strained: 'It is not a weakness of character.' },
    close: {
      strong: 'Trust your judgement; it is one of the better things in this chart.',
      mixed: 'Finish things deliberately rather than relying on enthusiasm to carry you.',
      strained: 'Give the mind something steady to hold — routine, a discipline, a person — and it settles.',
    },
  },
  {
    id: 'fortune', title: 'Fortune and support', strap: 'the ninth and eleventh', bhavas: [9, 11],
    open: {
      strong: 'Help arrives in this chart, and it arrives from above — teachers, elders, people with more standing than you.',
      mixed: 'Fortune is uneven. Some doors open without effort and others stay shut no matter how hard they are pushed.',
      strained: 'Fortune is thin here. What you get, you get by your own effort; the helping hand is late or absent.',
    },
    turn: { strong: 'It is worth being deliberate about.', mixed: 'Which doors is the useful question.', strained: 'That is not the same as being alone.' },
    close: {
      strong: 'Ask for help. This chart rewards the person who does.',
      mixed: 'Do not read a closed door as a verdict; read it as a direction.',
      strained: 'Build your own network early, because the inherited one will not carry you.',
    },
  },
  {
    id: 'family', title: 'Family and siblings', strap: 'the third and fourth', bhavas: [3, 4],
    open: {
      strong: 'Family holds together here. Siblings are an asset and the household you come from steadies you.',
      mixed: 'Family gives with one hand. There is support and there is friction, and both come from the same people.',
      strained: 'Family is a point of loss rather than support. Siblings are distant, or the household you come from does not back you.',
    },
    turn: { strong: 'It is not unconditional.', mixed: 'The friction is worth naming.', strained: 'What you build yourself will be sturdier.' },
    close: {
      strong: 'Keep the ties; they are one of the better parts of this chart.',
      mixed: 'Keep the people and drop the expectation that they will change.',
      strained: 'Do not wait for the family to become what it is not. Build the household you want.',
    },
  },
  {
    id: 'spirit', title: 'Dharma and inward life', strap: 'the ninth and twelfth', bhavas: [9, 12],
    open: {
      strong: 'There is a real inward pull in this chart — an interest in what lies behind things, and a capacity to be alone with it.',
      mixed: 'The inward life is present but not dominant. It shows up in seasons rather than as a constant.',
      strained: 'The inward life is a place of loss here rather than gain — retreat costs you, and solitude is not restful.',
    },
    turn: { strong: 'It is not otherworldly.', mixed: 'That is workable.', strained: 'That is worth knowing before you withdraw.' },
    close: {
      strong: 'Whatever practice you take up will hold. Take one up.',
      mixed: 'Let it be seasonal; forcing it does not help.',
      strained: 'Find your steadiness in people and work rather than in solitude.',
    },
  },
];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/\.+$/, '');
const asSentence = (s: string) => (/[.!?]$/.test(s) ? s : s + '.');

/**
 * When does this chapter activate? The mahādaśā whose lord rules the chapter's
 * primary bhāva. Returns null where the tree has no such period, so the chapter
 * says nothing rather than inventing a window.
 */
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
    const from = parseDashaDate(hit.startDate).getFullYear();
    const to = parseDashaDate(hit.endDate).getFullYear();
    const name = GRAHA_PROPERTIES[lord]?.name ?? lord;
    return `${name} period, ${from} to ${to}`;
  } catch {
    return null;
  }
}

export function buildNarrative(chart: JyotishaChart): Chapter[] {
  return SECTORS.map((s) => {
    const own = readBhava(chart, s.bhavas[0]);
    const all = readBhavas(chart, s.bhavas);
    const findings = own.length ? own : all;
    const support = all.filter((f) => !findings.some((g) => g.text === f.text));

    const good = findings.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight);
    const bad = findings.filter((f) => f.side === 'b').sort((a, b) => b.weight - a.weight);
    const pos = good.reduce((x, f) => x + f.weight, 0);
    const neg = bad.reduce((x, f) => x + f.weight, 0);
    const standing: Chapter['standing'] =
      pos > neg * 1.25 ? 'strong' : neg > pos * 1.25 ? 'strained' : 'mixed';

    const paragraphs: string[] = [s.open[standing]];

    const give = Array.from(new Set(good.map((f) => noDot(f.predicts || '')))).filter(Boolean).slice(0, 2);
    if (give.length) paragraphs.push(asSentence(cap(give.join(' '))));

    const cost = Array.from(new Set(bad.map((f) => noDot(f.predicts || '')))).filter(Boolean).slice(0, 2);
    if (cost.length) paragraphs.push(`${s.turn[standing]} ${asSentence(cap(cost.join(' ')))}`);

    const extra = support.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight).slice(0, 1);
    if (extra.length && paragraphs.length > 1) {
      paragraphs.push(`A second placement points the same way: ${noDot(extra[0].text)}.`);
    }

    if (s.id === 'career') paragraphs.push(careerMode(chart).answer);
    if (s.id === 'marriage') paragraphs.push(marriageMode(chart).answer);

    const period = periodFor(chart, s.bhavas[0]);
    if (period) {
      paragraphs.push(`This chapter is most active during the ${period} — that is when what it describes is most likely to be happening.`);
    }

    paragraphs.push(s.close[standing]);

    return {
      id: s.id,
      title: s.title,
      strap: s.strap,
      paragraphs: paragraphs.filter((p) => p && p.trim().length > 0),
      standing,
    };
  });
}
