/**
 * PHALITA — the second tranche of questions.
 *
 * Same engine as the first catalogue: a pair of opposed answers, the placements
 * that push either way, a published weight for each. Kept in its own file so
 * the catalogue can grow without one enormous module.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import type { Question, QFactor } from './questions';

const BEN: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MAL: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const KENDRA = [1, 4, 7, 10];
const DUS = [6, 8, 12];

/** Questions grave enough that one placement must never answer them. */
const SENSITIVE = new Set(['divorce', 'accident', 'second-marriage', 'surgery', 'adoption']);

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

export function buildQuestions2(chart: JyotishaChart): Question[] {
  const out: Question[] = [];
  const L = (h: number) => chart.bhavas[h - 1]?.rashiLord as PlanetId | undefined;
  const P = (p?: PlanetId) => (p ? chart.planets[p] : undefined);
  const O = (h: number) => (chart.bhavas[h - 1]?.planetsInHouse ?? []) as PlanetId[];
  const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
  const bal = (p?: PlanetId) => (p ? sb[p]?.totalVirupas ?? 0 : 0);
  const asp = (p: PlanetId) => chart.planets[p].aspectsToHouses ?? [];
  const benAsp = (h: number) => BEN.some((b) => asp(b).includes(h));

  const ask = (
    id: string, domain: string, question: string, a: string, b: string,
    rules: [('a' | 'b'), number, string, string][]
  ) => {
    const f: QFactor[] = [];
    let sa = 0, sb2 = 0, ca = 0, cb = 0;
    for (const [side, w, label, ground] of rules) {
      if (w <= 0) continue;
      if (side === 'a') { sa += w; ca += 1; } else { sb2 += w; cb += 1; }
      f.push({ label, side, weight: Math.round(w * 10) / 10, ground });
    }
    const m = Math.abs(sa - sb2);
    const lead = sa >= sb2 ? a : b;
    // A grave question is not answered by one placement. If only one condition
    // supports the leading side, the engine says it cannot call it — otherwise
    // every chart yields an extreme reading, since every chart has an affliction.
    const winning = sa >= sb2 ? ca : cb;
    const thin = SENSITIVE.has(id) && winning < 2;
    out.push({
      id, domain, question, a, b,
      aScore: Math.round(sa * 10) / 10,
      bScore: Math.round(sb2 * 10) / 10,
      answer: thin
        ? `Not enough to call. One placement points towards "${lead}", and nothing else in the chart corroborates it. A question this serious is not settled by a single condition, so this platform withholds it rather than pronouncing it.`
        : m < 1.5
        ? `Split. The chart does not settle this — it reads almost evenly between ${a.toLowerCase()} and ${b.toLowerCase()}.`
        : m < 4
        ? `Leaning: ${lead}. The indications are not one-sided, but the balance sits there.`
        : `${lead} — and clearly so.`,
      confidence: thin || m < 1.5 ? 'mixed' : m < 4 ? 'leaning' : 'clear',
      factors: f,
      caveat:
        'Synthesis, not a quotation. No verse answers this question outright — the judgement is built from the significations the texts give the houses and grahas, and the weights are shown so you can disagree with any line of it.',
    });
  };

  const l1 = L(1), l2 = L(2), l4 = L(4), l6 = L(6), l7 = L(7), l10 = L(10), l11 = L(11);

  ask('debt', 'Money', 'Do you carry debt, or stay clear of it?', 'Debt follows you', 'You stay clear', [
    [DUS.includes(P(l6)?.house ?? 0) ? 'a' : 'b', 2, 'sixth lord placement', 'Phaladīpikā 16.19'],
    [O(6).some((o) => MAL.includes(o)) ? 'a' : 'b', 1.5, 'malefics in the sixth — borrowing and repayment', 'Phaladīpikā 16.19'],
    [dig(P(l2)?.dignity ?? '') > 0 ? 'b' : 'a', 2, 'lord of wealth strong — the means to clear what is owed', 'Phaladīpikā 16.5'],
    [O(2).some((o) => BEN.includes(o)) ? 'b' : 'a', 1, 'benefics in the second — resources hold', 'Phaladīpikā 16.5'],
  ]);

  ask('inheritance', 'Money', 'Is there inheritance or family property coming?', 'Yes, it comes', 'No, you build your own', [
    [dig(P(L(8))?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'eighth lord strong — legacies and the hidden', 'Phaladīpikā 16.21'],
    [O(8).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the eighth — gain through others', 'Phaladīpikā 16.21'],
    [dig(P(l4)?.dignity ?? '') > 0 ? 'a' : 'b', 1.5, 'fourth lord strong — ancestral property holds', 'Phaladīpikā 16.13'],
    [DUS.includes(P(l4)?.house ?? 0) ? 'b' : 'a', 1.5, 'fourth lord fallen — the family base is lost', 'Phaladīpikā 16.14'],
  ]);

  ask('vehicles', 'Property', 'Vehicles and comforts — easily obtained?', 'Yes, they come', 'No, they are delayed', [
    [dig(chart.planets.venus.dignity) > 0 ? 'a' : 'b', 2, 'Venus as kāraka of comfort', 'Phaladīpikā 16.13'],
    [dig(P(l4)?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'fourth lord strong — conveyances', 'Phaladīpikā 16.13'],
    [O(4).some((o) => MAL.includes(o)) ? 'b' : 'a', 1.5, 'malefics in the fourth — comfort obstructed', 'Phaladīpikā 16.14'],
  ]);

  ask('siblings', 'Family', 'Siblings — support or distance?', 'Support', 'Distance', [
    [dig(P(L(3))?.dignity ?? '') > 0 ? 'a' : 'b', 2.5, 'third lord strong — siblings help', 'Phaladīpikā 16.8'],
    [DUS.includes(P(L(3))?.house ?? 0) ? 'b' : 'a', 2, 'third lord fallen — separation from siblings', 'Phaladīpikā 16.8'],
    [O(3).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the third — allies', 'Phaladīpikā 16.8'],
    [O(3).some((o) => MAL.includes(o)) ? 'b' : 'a', 1.5, 'malefics in the third — friction with peers', 'Phaladīpikā 16.8'],
  ]);

  ask('mother', 'Family', 'The mother — a strong bond or a difficult one?', 'Strong bond', 'Difficult', [
    [dig(P(l4)?.dignity ?? '') > 0 ? 'a' : 'b', 2.5, 'fourth lord strong — the mother flourishes', 'Phaladīpikā 16.13'],
    [DUS.includes(P(l4)?.house ?? 0) ? 'b' : 'a', 2, 'fourth lord fallen — distance from the mother', 'Phaladīpikā 16.14'],
    [O(4).includes('moon') ? 'a' : 'b', 1.5, 'Moon in the fourth — maternal bond', 'Phaladīpikā 9.7'],
  ]);

  ask('father', 'Family', 'The father — support, or a gap?', 'Support', 'A gap', [
    [dig(P(L(9))?.dignity ?? '') > 0 ? 'a' : 'b', 2.5, 'ninth lord strong — the father supports', 'Phaladīpikā 16.27'],
    [DUS.includes(P(L(9))?.house ?? 0) ? 'b' : 'a', 2, 'ninth lord fallen — the father is distant or lost early', 'Phaladīpikā 16.19'],
    [dig(chart.planets.sun.dignity) > 0 ? 'a' : 'b', 1.5, 'Sun strong — the paternal line holds', 'Phaladīpikā 19.5'],
  ]);

  ask('speech', 'Character', 'Is your speech a strength or a liability?', 'A strength', 'A liability', [
    [dig(P(l2)?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'second lord strong — the voice carries', 'Phaladīpikā 16.5'],
    [dig(chart.planets.mercury.dignity) > 0 ? 'a' : 'b', 2.5, 'Mercury strong — clear and persuasive', 'Phaladīpikā 19.10'],
    [chart.planets.mercury.isCombust ? 'b' : 'a', 1.5, 'Mercury combust — words misfire', 'Phaladīpikā 19.10'],
    [O(2).some((o) => MAL.includes(o)) ? 'b' : 'a', 1.5, 'malefics in the second — harsh speech', 'Phaladīpikā 16.5'],
  ]);

  ask('courage', 'Character', 'Are you bold by nature, or cautious?', 'Bold', 'Cautious', [
    [dig(chart.planets.mars.dignity) > 0 ? 'a' : 'b', 2.5, 'Mars strong — nerve and force', 'Phaladīpikā 19.9'],
    [dig(P(L(3))?.dignity ?? '') > 0 ? 'a' : 'b', 1.5, 'third lord strong — courage', 'Phaladīpikā 16.8'],
    [O(1).includes('mars') ? 'a' : 'b', 2, 'Mars on the lagna — a fighter', 'Phaladīpikā 16.4'],
    [dig(chart.planets.saturn.dignity) > 0 ? 'b' : 'a', 1, 'Saturn strong — patience over impulse', 'Phaladīpikā 19.13'],
  ]);

  ask('leadership', 'Career', 'Do you end up leading people?', 'Yes, you lead', 'No, you execute', [
    [O(10).includes('sun') || O(1).includes('sun') ? 'a' : 'b', 2.5, 'Sun in the tenth or first — command', 'Phaladīpikā 16.28'],
    [dig(P(l10)?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'tenth lord strong — standing to lead', 'Phaladīpikā 16.27'],
    [dig(chart.planets.jupiter.dignity) > 0 ? 'a' : 'b', 1.5, 'Jupiter strong — counsel others follow', 'Phaladīpikā 19.11'],
    [O(10).includes('saturn') ? 'b' : 'a', 1.5, 'Saturn in the tenth — service and process', 'Phaladīpikā 19.13'],
  ]);

  ask('creative', 'Talent', 'Creative and artistic work — is there real aptitude?', 'Yes, real aptitude', 'Not particularly', [
    [dig(chart.planets.venus.dignity) > 0 ? 'a' : 'b', 2.5, 'Venus strong — form, beauty, craft', 'Phaladīpikā 19.12'],
    [dig(chart.planets.moon.dignity) > 0 ? 'a' : 'b', 1.5, 'Moon strong — imagination', 'Phaladīpikā 9.7'],
    [O(5).includes('venus') || O(5).includes('moon') ? 'a' : 'b', 2, 'Venus or Moon in the fifth — creative mind', 'Phaladīpikā 16.15'],
    [dig(P(L(5))?.dignity ?? '') > 0 ? 'a' : 'b', 1.5, 'fifth lord strong', 'Phaladīpikā 16.15'],
  ]);

  ask('teaching', 'Talent', 'Teaching, writing or counsel — does it suit you?', 'Yes, it suits', 'No, it does not', [
    [dig(chart.planets.jupiter.dignity) > 0 ? 'a' : 'b', 2.5, 'Jupiter strong — the teacher', 'Phaladīpikā 19.11'],
    [dig(chart.planets.mercury.dignity) > 0 ? 'a' : 'b', 2, 'Mercury strong — the writer and speaker', 'Phaladīpikā 19.10'],
    [O(2).includes('jupiter') || O(9).includes('jupiter') ? 'a' : 'b', 1.5, 'Jupiter in the second or ninth — knowledge shared', 'Phaladīpikā 19.11'],
    [O(10).includes('saturn') ? 'b' : 'a', 1, 'Saturn in the tenth — practical rather than academic work', 'Phaladīpikā 19.13'],
  ]);

  ask('politics', 'Career', 'Politics or public office through election — indicated?', 'Yes', 'No', [
    [O(10).includes('sun') ? 'a' : 'b', 2.5, 'Sun in the tenth — public command', 'Phaladīpikā 16.28'],
    [dig(chart.planets.mars.dignity) > 0 && dig(P(l10)?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'Mars and the tenth lord both strong — the fight for office', 'Phaladīpikā 19.9'],
    [O(11).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the eleventh — a following', 'Phaladīpikā 16.29'],
    [dig(chart.planets.saturn.dignity) > 0 ? 'b' : 'a', 1, 'Saturn strong — a slow, unglamorous path', 'Phaladīpikā 19.13'],
  ]);

  ask('foreign-job', 'Career', 'Work abroad, or in your own country?', 'Abroad', 'At home', [
    [O(12).includes('rahu') ? 'a' : 'b', 2.5, 'Rāhu in the twelfth — foreign employment', 'Phaladīpikā 19.15'],
    [KENDRA.includes(P(L(12))?.house ?? 0) ? 'a' : 'b', 1.5, 'twelfth lord in a kendra', 'Phaladīpikā 16.19'],
    [dig(P(l4)?.dignity ?? '') > 0 ? 'b' : 'a', 1.5, 'fourth lord strong — rooted at home', 'Phaladīpikā 16.13'],
  ]);

  ask('job-change', 'Career', 'Is your career stable, or marked by changes?', 'Stable', 'Frequent change', [
    [dig(chart.planets.saturn.dignity) > 0 ? 'a' : 'b', 2, 'Saturn strong — continuity', 'Phaladīpikā 19.13'],
    [dig(chart.planets.moon.dignity) > 0 ? 'a' : 'b', 1.5, 'Moon steady — a settled mind', 'Phaladīpikā 9.7'],
    [O(10).includes('rahu') ? 'b' : 'a', 2, 'Rāhu in the tenth — disruption and re-invention', 'Phaladīpikā 19.15'],
    [dig(P(l10)?.dignity ?? '') < 0 ? 'b' : 'a', 1.5, 'tenth lord weak — the ground shifts', 'Phaladīpikā 16.27'],
  ]);

  ask('promotion', 'Career', 'Do you rise in position over time?', 'Yes, steadily', 'You plateau', [
    [dig(P(l10)?.dignity ?? '') > 0 ? 'a' : 'b', 2.5, 'tenth lord strong — promotion follows', 'Phaladīpikā 16.27'],
    [bal(l10) > bal(l1) ? 'a' : 'b', 2, 'tenth lord outweighs the lagna — the career is the engine', 'Phaladīpikā 16.17'],
    [DUS.includes(P(l10)?.house ?? 0) ? 'b' : 'a', 2, 'tenth lord fallen — advancement stalls', 'Phaladīpikā 16.19'],
  ]);

  ask('loan', 'Money', 'Will you need to borrow for a house or business?', 'Yes', 'No', [
    [DUS.includes(P(l2)?.house ?? 0) ? 'a' : 'b', 1.5, 'lord of wealth fallen — capital is short', 'Phaladīpikā 16.19'],
    [dig(P(l4)?.dignity ?? '') > 0 ? 'b' : 'a', 1.5, 'fourth lord strong — property from your own means', 'Phaladīpikā 16.13'],
    [O(6).some((o) => MAL.includes(o)) ? 'a' : 'b', 1, 'malefics in the sixth — debt as a fact of life', 'Phaladīpikā 16.19'],
  ]);

  ask('enemies', 'Disputes', 'Do you attract open enemies?', 'Yes, many', 'Few', [
    [O(6).some((o) => MAL.includes(o)) ? 'a' : 'b', 2, 'malefics in the sixth — opposition gathers', 'Phaladīpikā 16.19'],
    [bal(l1) > bal(l6) ? 'b' : 'a', 2, 'lagna lord outweighs the sixth — you outlast them', 'Phaladīpikā 16.17'],
    [dig(P(l6)?.dignity ?? '') > 0 && DUS.includes(P(l6)?.house ?? 0) ? 'b' : 'a', 1.5, 'sixth lord strong but fallen — enemies defeat themselves', 'Phaladīpikā 16.18'],
  ]);

  ask('surgery', 'Health', 'Is surgery or medical intervention likely in life?', 'Yes', 'Unlikely', [
    [O(8).includes('mars') || O(8).includes('saturn') ? 'a' : 'b', 2, 'Mars or Saturn in the eighth — cutting and chronic', 'Phaladīpikā 16.21'],
    [O(6).includes('mars') ? 'a' : 'b', 1.5, 'Mars in the sixth — inflammation and injury', 'Phaladīpikā 19.9'],
    [bal(l1) > bal(l6) ? 'b' : 'a', 1.5, 'vitality outweighs affliction', 'Phaladīpikā 16.17'],
  ]);

  ask('sleep', 'Health', 'Is sleep and rest easy for you, or disturbed?', 'Easy', 'Disturbed', [
    [O(12).some((o) => MAL.includes(o)) ? 'b' : 'a', 2, 'malefics in the twelfth — rest is disturbed', 'Phaladīpikā 16.19'],
    [dig(chart.planets.moon.dignity) > 0 ? 'a' : 'b', 2, 'Moon strong — a settled mind', 'Phaladīpikā 9.7'],
    [O(4).includes('moon') ? 'a' : 'b', 1, 'Moon in the fourth — domestic peace', 'Phaladīpikā 9.7'],
  ]);

  ask('guru', 'Spirit', 'Will you find a teacher or guide?', 'Yes', 'You find your own way', [
    [dig(chart.planets.jupiter.dignity) > 0 ? 'a' : 'b', 2.5, 'Jupiter strong — a guru appears', 'Phaladīpikā 19.11'],
    [O(9).includes('jupiter') ? 'a' : 'b', 2, 'Jupiter in the ninth — the teacher is there', 'Phaladīpikā 19.11'],
    [O(9).includes('ketu') ? 'b' : 'a', 1.5, 'Ketu in the ninth — a solitary path', 'Phaladīpikā 19.17'],
  ]);

  ask('charity', 'Spirit', 'Do you give to others easily?', 'Yes', 'Not much', [
    [dig(chart.planets.jupiter.dignity) > 0 ? 'a' : 'b', 2, 'Jupiter strong — generosity', 'Phaladīpikā 19.11'],
    [O(12).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the twelfth — giving', 'Phaladīpikā 16.19'],
    [dig(P(l2)?.dignity ?? '') < 0 ? 'b' : 'a', 1, 'wealth tight — giving is harder', 'Phaladīpikā 16.5'],
  ]);

  ask('travel', 'Travel', 'Frequent travel in your life?', 'Yes, a great deal', 'Little', [
    [O(9).some((o) => MAL.includes(o)) ? 'a' : 'b', 2, 'malefics in the ninth — long journeys', 'Phaladīpikā 16.27'],
    [O(3).includes('rahu') ? 'a' : 'b', 1.5, 'Rāhu in the third — constant movement', 'Phaladīpikā 19.15'],
    [dig(P(l4)?.dignity ?? '') > 0 ? 'b' : 'a', 1.5, 'fourth lord strong — a fixed base', 'Phaladīpikā 16.13'],
  ]);

  ask('writing', 'Talent', 'Do you have a gift for writing?', 'Yes', 'Not especially', [
    [dig(chart.planets.mercury.dignity) > 0 ? 'a' : 'b', 2.5, 'Mercury strong — words come easily', 'Phaladīpikā 19.10'],
    [O(2).includes('mercury') || O(5).includes('mercury') ? 'a' : 'b', 2, 'Mercury in the second or fifth — expression', 'Phaladīpikā 16.15'],
    [chart.planets.mercury.isCombust ? 'b' : 'a', 1.5, 'Mercury combust — expression blocked', 'Phaladīpikā 19.10'],
  ]);

  ask('music', 'Talent', 'Music or performance — is it in the chart?', 'Yes', 'Not really', [
    [dig(chart.planets.venus.dignity) > 0 ? 'a' : 'b', 2.5, 'Venus strong — melody and form', 'Phaladīpikā 19.12'],
    [O(5).includes('venus') ? 'a' : 'b', 2, 'Venus in the fifth — performance', 'Phaladīpikā 16.15'],
    [dig(chart.planets.moon.dignity) > 0 ? 'a' : 'b', 1, 'Moon strong — feeling in the voice', 'Phaladīpikā 9.7'],
  ]);

  ask('risk', 'Character', 'Do you take risks others avoid?', 'Yes', 'No, you are careful', [
    [dig(chart.planets.mars.dignity) > 0 ? 'a' : 'b', 2, 'Mars strong — appetite for risk', 'Phaladīpikā 19.9'],
    [O(5).includes('rahu') || O(1).includes('rahu') ? 'a' : 'b', 1.5, 'Rāhu on the lagna or fifth — the gambler', 'Phaladīpikā 19.15'],
    [dig(chart.planets.saturn.dignity) > 0 ? 'b' : 'a', 1.5, 'Saturn strong — caution', 'Phaladīpikā 19.13'],
  ]);

  ask('fame-timing', 'Reputation', 'Is recognition early in life or late?', 'Early', 'Late', [
    [bal(l10) > bal(l1) ? 'a' : 'b', 1.5, 'tenth lord outweighs the lagna — the career arrives early', 'Phaladīpikā 16.17'],
    [O(10).includes('saturn') ? 'b' : 'a', 2, 'Saturn in the tenth — recognition comes slowly', 'Phaladīpikā 19.13'],
    [dig(P(l10)?.dignity ?? '') > 0 ? 'a' : 'b', 1.5, 'tenth lord strong — it arrives', 'Phaladīpikā 16.27'],
  ]);

  ask('legacy', 'Family', 'Will your children carry your work or name forward?', 'Yes', 'Not necessarily', [
    [dig(P(L(5))?.dignity ?? '') > 0 ? 'a' : 'b', 2, 'fifth lord strong — progeny thrive', 'Phaladīpikā 16.15'],
    [O(5).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the fifth', 'Phaladīpikā 16.15'],
    [DUS.includes(P(L(5))?.house ?? 0) ? 'b' : 'a', 1.5, 'fifth lord fallen — distance from children', 'Phaladīpikā 16.19'],
  ]);

  ask('second-marriage', 'Marriage', 'Is more than one marriage indicated?', 'Yes, possible', 'No, one', [
    [O(7).includes('rahu') ? 'a' : 'b', 2, 'Rāhu in the seventh — unconventional or repeated unions', 'Phaladīpikā 19.15'],
    [dig(P(l7)?.dignity ?? '') < 0 ? 'a' : 'b', 1.5, 'seventh lord weak — the first bond strains', 'Phaladīpikā 16.20'],
    [O(7).includes('jupiter') ? 'b' : 'a', 1.5, 'Jupiter in the seventh — one sanctioned bond', 'Phaladīpikā 10.7'],
  ]);

  ask('inlaws', 'Marriage', 'Relationship with in-laws — smooth or strained?', 'Smooth', 'Strained', [
    [dig(P(l2)?.dignity ?? '') > 0 ? 'a' : 'b', 1.5, 'second lord strong — the new family holds', 'Phaladīpikā 16.5'],
    [O(2).some((o) => MAL.includes(o)) ? 'b' : 'a', 1.5, 'malefics in the second — friction with family', 'Phaladīpikā 16.5'],
    [O(7).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the seventh', 'Phaladīpikā 10.7'],
  ]);

  ask('divorce', 'Marriage', 'Is separation or divorce a live risk?', 'Yes, the risk is real', 'No, the bond holds', [
    [DUS.includes(P(l7)?.house ?? 0) ? 'a' : 'b', 2, 'seventh lord fallen — the bond is strained', 'Phaladīpikā 16.19'],
    [O(7).some((o) => MAL.includes(o)) ? 'a' : 'b', 2, 'malefics in the seventh', 'Phaladīpikā 10.15'],
    [O(7).some((o) => BEN.includes(o)) ? 'b' : 'a', 2, 'benefics in the seventh — protection', 'Phaladīpikā 10.7'],
    [dig(P(l7)?.dignity ?? '') > 0 ? 'b' : 'a', 1.5, 'seventh lord strong — it holds', 'Phaladīpikā 16.20'],
  ]);

  ask('adoption', 'Children', 'Is adoption or a non-biological child indicated?', 'Yes, possible', 'No', [
    [DUS.includes(P(L(5))?.house ?? 0) ? 'a' : 'b', 1.5, 'fifth lord fallen — progeny comes by another route', 'Phaladīpikā 16.19'],
    [O(5).some((o) => MAL.includes(o)) ? 'a' : 'b', 1.5, 'malefics in the fifth', 'Phaladīpikā 16.19'],
    [dig(P(L(5))?.dignity ?? '') > 0 ? 'b' : 'a', 1.5, 'fifth lord strong — direct progeny', 'Phaladīpikā 16.15'],
  ]);

  ask('sports', 'Talent', 'Physical sport or martial skill — aptitude?', 'Yes', 'Not really', [
    [dig(chart.planets.mars.dignity) > 0 ? 'a' : 'b', 2.5, 'Mars strong — the body as instrument', 'Phaladīpikā 19.9'],
    [O(3).includes('mars') || O(1).includes('mars') ? 'a' : 'b', 2, 'Mars in the first or third — physical drive', 'Phaladīpikā 16.8'],
    [bal(l1) > bal(l6) ? 'a' : 'b', 1.5, 'vitality outweighs affliction', 'Phaladīpikā 16.17'],
  ]);

  ask('teaching-job', 'Career', 'Is a career in education or research suitable?', 'Yes', 'No', [
    [dig(chart.planets.mercury.dignity) > 0 ? 'a' : 'b', 2, 'Mercury strong — the scholar', 'Phaladīpikā 19.10'],
    [dig(chart.planets.jupiter.dignity) > 0 ? 'a' : 'b', 2, 'Jupiter strong — the teacher', 'Phaladīpikā 19.11'],
    [O(4).includes('mercury') || O(5).includes('jupiter') ? 'a' : 'b', 1.5, 'learning placements in the fourth or fifth', 'Phaladīpikā 16.15'],
    [O(10).includes('saturn') ? 'b' : 'a', 1, 'Saturn in the tenth — practical work over academic', 'Phaladīpikā 19.13'],
  ]);

  ask('accident', 'Health', 'Are accidents or sudden injury a recurring risk?', 'Yes, caution is needed', 'No, low risk', [
    [O(8).includes('mars') ? 'a' : 'b', 2.5, 'Mars in the eighth — sudden injury', 'Phaladīpikā 16.21'],
    [O(1).includes('mars') || O(1).includes('rahu') ? 'a' : 'b', 1.5, 'Mars or Rāhu on the lagna', 'Phaladīpikā 16.4'],
    [bal(l1) > bal(l6) ? 'b' : 'a', 1.5, 'vitality outweighs affliction', 'Phaladīpikā 16.17'],
  ]);

  ask('prosperity', 'Money', 'Does life get materially easier as it goes on?', 'Yes, it improves', 'No, it stays hard', [
    [dig(P(l2)?.dignity ?? '') > 0 && dig(P(l11)?.dignity ?? '') > 0 ? 'a' : 'b', 3, 'wealth and gains both strong', 'Phaladīpikā 16.5'],
    [DUS.includes(P(l2)?.house ?? 0) && DUS.includes(P(l11)?.house ?? 0) ? 'b' : 'a', 2, 'both fallen — means stay short', 'Phaladīpikā 16.19'],
    [O(2).some((o) => BEN.includes(o)) ? 'a' : 'b', 1.5, 'benefics in the second', 'Phaladīpikā 16.5'],
    [benAsp(11) ? 'a' : 'b', 1, 'benefic dṛṣṭi on the eleventh', 'Phaladīpikā 16.29'],
  ]);

  return out;
}
