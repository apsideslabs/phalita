/**
 * PHALITA — the question catalogue.
 *
 * Everything a person actually asks, turned into something the chart can be
 * tested against. Each question is a pair of opposed answers, a set of factors
 * that push towards one side or the other, and a rule for when the chart is too
 * split to call.
 *
 * This is synthesis, not quotation. No verse says "you will settle abroad" —
 * the judgement is built from the significations the texts give the houses and
 * grahas, and every factor is published with its weight and its ground so the
 * reader can argue with any line of it.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';

export interface QFactor {
  label: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
}

export interface Question {
  id: string;
  domain: string;
  question: string;
  a: string;
  b: string;
  aScore: number;
  bScore: number;
  answer: string;
  confidence: 'clear' | 'leaning' | 'mixed';
  factors: QFactor[];
  caveat: string;
}

const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
const KENDRA = [1, 4, 7, 10];
const DUSTHANA = [6, 8, 12];

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

class Tally {
  a = 0;
  b = 0;
  factors: QFactor[] = [];
  add(side: 'a' | 'b', weight: number, label: string, ground: string) {
    if (weight <= 0) return;
    if (side === 'a') this.a += weight; else this.b += weight;
    this.factors.push({ label, side, weight: Math.round(weight * 10) / 10, ground });
  }
  build(id: string, domain: string, question: string, a: string, b: string): Question {
    const margin = Math.abs(this.a - this.b);
    const lead = this.a >= this.b ? a : b;
    const answer =
      margin < 1.5
        ? `Split. The chart does not settle this — it reads almost evenly between ${a.toLowerCase()} and ${b.toLowerCase()}, so the outcome is more likely to be decided by circumstance than by the chart.`
        : margin < 4
        ? `Leaning: ${lead}. The indications are not one-sided, but the balance sits there.`
        : `${lead} — and clearly so.`;
    return {
      id,
      domain,
      question,
      a,
      b,
      aScore: Math.round(this.a * 10) / 10,
      bScore: Math.round(this.b * 10) / 10,
      answer,
      confidence: margin < 1.5 ? 'mixed' : margin < 4 ? 'leaning' : 'clear',
      factors: this.factors,
      caveat:
        'Synthesis, not a quotation. No verse answers this question outright — the judgement is built from the significations the texts give the houses and grahas, and the weights are shown so you can disagree with any line of it.',
    };
  }
}

export function buildQuestions(chart: JyotishaChart): Question[] {
  const out: Question[] = [];
  const lord = (h: number) => chart.bhavas[h - 1]?.rashiLord as PlanetId | undefined;
  const pl = (p?: PlanetId) => (p ? chart.planets[p] : undefined);
  const occ = (h: number) => (chart.bhavas[h - 1]?.planetsInHouse ?? []) as PlanetId[];
  const aspects = (p: PlanetId) => chart.planets[p].aspectsToHouses ?? [];
  const anyBeneficAspects = (h: number) => BENEFICS.some((b) => aspects(b).includes(h));

  // ---- Wealth accumulating ------------------------------------------------
  {
    const t = new Tally();
    const l2 = lord(2), l11 = lord(11);
    const p2 = pl(l2), p11 = pl(l11);
    if (p2) {
      if (dig(p2.dignity) > 0) t.add('a', dig(p2.dignity) + 1, 'lord of wealth strong — money holds and grows', 'Phaladīpikā 16.5');
      else if (dig(p2.dignity) < 0) t.add('b', Math.abs(dig(p2.dignity)) + 1, 'lord of wealth weak — income leaks', 'Phaladīpikā 16.5');
      if (DUSTHANA.includes(p2.house)) t.add('b', 1.5, 'lord of wealth in a duḥsthāna — earnings tied to loss', 'Phaladīpikā 16.19');
    }
    if (p11) {
      if (dig(p11.dignity) > 0) t.add('a', dig(p11.dignity), 'lord of gains well placed — income exceeds need', 'Phaladīpikā 16.29');
      if (occ(11).some((o) => BENEFICS.includes(o))) t.add('a', 1.5, 'benefics in the eleventh — steady gain', 'Phaladīpikā 16.29');
      if (occ(11).some((o) => MALEFICS.includes(o))) t.add('b', 1, 'malefics in the eleventh — gains contested', 'Phaladīpikā 16.29');
    }
    if (occ(2).includes('jupiter') || occ(2).includes('venus')) t.add('a', 1.5, 'Jupiter or Venus in the second — wealth by grace and by dealing', 'Phaladīpikā 16.5');
    out.push(t.build('wealth', 'Money', 'Will money accumulate, or stay tight?', 'It accumulates', 'It stays tight'));
  }

  // ---- Owning property ----------------------------------------------------
  {
    const t = new Tally();
    const l4 = lord(4), p4 = pl(l4);
    if (p4) {
      if (dig(p4.dignity) > 0) t.add('a', dig(p4.dignity) + 1, 'lord of the fourth strong — property comes', 'Phaladīpikā 16.13');
      if (DUSTHANA.includes(p4.house)) t.add('b', 2, 'lord of the fourth in a duḥsthāna — property lost or delayed', 'Phaladīpikā 16.14');
      if (p4.isCombust) t.add('b', 1, 'lord of the fourth burnt by the Sun', 'Phaladīpikā 16.14');
    }
    if (dig(chart.planets.venus.dignity) > 0) t.add('a', 1.5, 'Venus strong — comfort and possessions', 'Phaladīpikā 16.13');
    if (occ(4).some((o) => MALEFICS.includes(o))) t.add('b', 1.5, 'malefics in the fourth — the home is the weak point', 'Phaladīpikā 16.14');
    if (anyBeneficAspects(4)) t.add('a', 1, 'benefic dṛṣṭi on the fourth — protected home', 'Phaladīpikā 16.13');
    out.push(t.build('property', 'Property', 'Will you own property of your own?', 'Yes, property comes', 'No, it stays out of reach'));
  }

  // ---- Children -----------------------------------------------------------
  {
    const t = new Tally();
    const l5 = lord(5), p5 = pl(l5);
    if (p5) {
      if (dig(p5.dignity) > 0) t.add('a', dig(p5.dignity) + 1, 'lord of children strong', 'Phaladīpikā 16.15');
      if (DUSTHANA.includes(p5.house)) t.add('b', 1.5, 'lord of children in a duḥsthāna — delay', 'Phaladīpikā 16.19');
      if (p5.isCombust) t.add('b', 1, 'lord of children combust', 'Phaladīpikā 16.19');
    }
    if (occ(5).some((o) => BENEFICS.includes(o))) t.add('a', 1.5, 'benefics in the fifth — children and intelligence', 'Phaladīpikā 16.15');
    if (occ(5).some((o) => MALEFICS.includes(o))) t.add('b', 1.5, 'malefics in the fifth — obstruction to progeny', 'Phaladīpikā 16.19');
    if (dig(chart.planets.jupiter.dignity) > 0) t.add('a', 1.5, 'Jupiter strong — the kāraka of children', 'Phaladīpikā 19.11');
    if (anyBeneficAspects(5)) t.add('a', 1, 'benefic dṛṣṭi on the fifth', 'Phaladīpikā 16.15');
    out.push(t.build('children', 'Children', 'Children — do they come easily or with delay?', 'They come', 'There is delay or difficulty'));
  }

  // ---- Higher education ---------------------------------------------------
  {
    const t = new Tally();
    const l4 = lord(4), l5 = lord(5), l9 = lord(9);
    for (const [l, name, g] of [
      [l4, 'fourth', 'Phaladīpikā 16.13'],
      [l5, 'fifth', 'Phaladīpikā 16.15'],
      [l9, 'ninth', 'Phaladīpikā 16.27'],
    ] as [PlanetId | undefined, string, string][]) {
      const p = pl(l);
      if (!p) continue;
      if (dig(p.dignity) > 0) t.add('a', dig(p.dignity), `lord of the ${name} strong — learning holds`, g);
      if (DUSTHANA.includes(p.house)) t.add('b', 1, `lord of the ${name} in a duḥsthāna`, 'Phaladīpikā 16.19');
    }
    if (occ(4).includes('mercury') || occ(5).includes('mercury')) t.add('a', 2, 'Mercury in the fourth or fifth — a studious mind', 'Phaladīpikā 19.10');
    if (occ(5).includes('jupiter') || occ(9).includes('jupiter')) t.add('a', 1.5, 'Jupiter in the fifth or ninth — higher learning', 'Phaladīpikā 19.11');
    if (chart.planets.mercury.isCombust) t.add('b', 1.5, 'Mercury combust — study disrupted', 'Phaladīpikā 19.10');
    out.push(t.build('education', 'Education', 'Higher education — does it complete?', 'It completes', 'It is broken or abandoned'));
  }

  // ---- Settlement abroad --------------------------------------------------
  {
    const t = new Tally();
    const l9 = lord(9), l12 = lord(12), l4 = lord(4);
    const p9 = pl(l9), p12 = pl(l12), p4 = pl(l4);
    if (p9 && (p9.house === 12 || p9.house === 9)) t.add('a', 2, 'lord of fortune in the twelfth or ninth — distance brings fortune', 'Phaladīpikā 16.27');
    if (p12 && KENDRA.includes(p12.house)) t.add('a', 1.5, 'lord of the twelfth in a kendra — life lived away', 'Phaladīpikā 16.19');
    if (p4 && DUSTHANA.includes(p4.house)) t.add('a', 1.5, 'lord of the fourth in a duḥsthāna — the home is elsewhere', 'Phaladīpikā 16.14');
    if (occ(12).includes('rahu')) t.add('a', 2, 'Rāhu in the twelfth — foreign ground', 'Phaladīpikā 19.15');
    if (occ(4).includes('moon') && dig(chart.planets.moon.dignity) > 1) t.add('b', 1.5, 'Moon strong in the fourth — rooted at home', 'Phaladīpikā 9.7');
    out.push(t.build('abroad', 'Travel', 'Settle abroad, or stay near home?', 'Abroad', 'Near home'));
  }

  // ---- Public recognition -------------------------------------------------
  {
    const t = new Tally();
    const l10 = lord(10), p10 = pl(l10);
    if (p10) {
      if ([1, 4, 5, 7, 9, 10].includes(p10.house) && dig(p10.dignity) > 0) t.add('a', 3, 'tenth lord strong in a kendra or koṇa — fame follows the work', 'Phaladīpikā 16.27');
      if (DUSTHANA.includes(p10.house)) t.add('b', 2, 'tenth lord in a duḥsthāna — work unrecognised', 'Phaladīpikā 16.19');
    }
    if (occ(10).includes('sun') || occ(10).includes('jupiter')) t.add('a', 2, 'Sun or Jupiter in the tenth — standing in the world', 'Phaladīpikā 16.28');
    if (anyBeneficAspects(10)) t.add('a', 1, 'benefic dṛṣṭi on the tenth', 'Phaladīpikā 16.27');
    out.push(t.build('fame', 'Reputation', 'Will you be publicly recognised?', 'Yes, recognition comes', 'No, the work stays quiet'));
  }

  // ---- Litigation ---------------------------------------------------------
  {
    const t = new Tally();
    const l6 = lord(6), p6 = pl(l6);
    const l1 = lord(1), p1 = pl(l1);
    if (p6) {
      if (dig(p6.dignity) > 0 && DUSTHANA.includes(p6.house)) t.add('a', 2, 'sixth lord strong but fallen — you win against opposition', 'Phaladīpikā 16.18');
      if (dig(p6.dignity) > 0 && !DUSTHANA.includes(p6.house)) t.add('b', 2, 'sixth lord strong and well placed — disputes find you', 'Phaladīpikā 16.19');
    }
    if (p1 && p6) {
      const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
      const s1 = sb[l1 as PlanetId]?.totalVirupas ?? 0;
      const s6 = sb[l6 as PlanetId]?.totalVirupas ?? 0;
      if (s1 > s6) t.add('a', 2, 'lagna lord outweighs the sixth — adversaries weaken', 'Phaladīpikā 16.17');
      else t.add('b', 1.5, 'sixth lord outweighs the lagna — long fights', 'Phaladīpikā 16.19');
    }
    if (occ(6).includes('saturn') || occ(6).includes('mars')) t.add('b', 1.5, 'Saturn or Mars in the sixth — prolonged conflict', 'Phaladīpikā 19.13');
    out.push(t.build('litigation', 'Disputes', 'Court cases and open conflict — do you win?', 'You prevail', 'They drag on against you'));
  }

  // ---- Government service ------------------------------------------------
  {
    const t = new Tally();
    const l10 = lord(10), p10 = pl(l10);
    if (p10 && (p10.house === 10 || p10.house === 1)) t.add('a', 2, 'tenth lord in the tenth or first — office and authority', 'Phaladīpikā 16.27');
    if (occ(10).includes('sun')) t.add('a', 2.5, 'Sun in the tenth — state service, office, command', 'Phaladīpikā 16.28');
    if (occ(10).includes('jupiter')) t.add('a', 1.5, 'Jupiter in the tenth — advisory or judicial office', 'Phaladīpikā 16.28');
    if (occ(10).includes('saturn')) t.add('b', 1.5, 'Saturn in the tenth — slow, graded service rather than office', 'Phaladīpikā 19.13');
    if (chart.planets.sun.isCombust) t.add('b', 1, 'Sun weak — authority does not come easily', 'Phaladīpikā 19.5');
    out.push(t.build('govt', 'Career', 'Government or public office — is it indicated?', 'Yes, office is indicated', 'No, it is not'));
  }

  // ---- Chronic health ----------------------------------------------------
  {
    const t = new Tally();
    const l1 = lord(1), p1 = pl(l1);
    const l6 = lord(6), p6 = pl(l6);
    if (p1 && p6) {
      const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
      const s1 = sb[l1 as PlanetId]?.totalVirupas ?? 0;
      const s6 = sb[l6 as PlanetId]?.totalVirupas ?? 0;
      if (s1 > s6) t.add('a', 2.5, 'lagna lord outweighs the sixth — the body resists', 'Phaladīpikā 16.17');
      else t.add('b', 2.5, 'sixth lord outweighs the lagna — illness takes hold', 'Phaladīpikā 16.17');
    }
    if (dig(chart.planets.sun.dignity) < 0) t.add('b', 1.5, 'Sun weak — vitality below par', 'Phaladīpikā 19.5');
    if (dig(chart.planets.moon.dignity) < 0) t.add('b', 1.5, 'Moon weak — the constitution is unsettled', 'Phaladīpikā 9.7');
    if (occ(6).some((o) => BENEFICS.includes(o))) t.add('a', 1.5, 'benefics in the sixth — illness is resisted', 'Phaladīpikā 16.18');
    if (occ(1).some((o) => MALEFICS.includes(o))) t.add('b', 1.5, 'malefics on the lagna — the body carries strain', 'Phaladīpikā 16.4');
    out.push(t.build('health', 'Health', 'Is the constitution robust, or prone to chronic trouble?', 'Robust', 'Prone to chronic trouble'));
  }

  // ---- Spiritual inclination ---------------------------------------------
  {
    const t = new Tally();
    if (occ(12).includes('jupiter') || occ(9).includes('jupiter')) t.add('a', 2.5, 'Jupiter in the ninth or twelfth — a religious bent', 'Phaladīpikā 19.11');
    if (occ(12).includes('ketu') || occ(9).includes('ketu')) t.add('a', 2, 'Ketu in the ninth or twelfth — detachment and seeking', 'Phaladīpikā 19.17');
    if (occ(12).includes('saturn')) t.add('a', 1, 'Saturn in the twelfth — renunciation by endurance', 'Phaladīpikā 19.13');
    if (occ(1).some((o) => ['sun', 'rahu', 'mars'].includes(o))) t.add('b', 1, 'strong worldly emphasis on the lagna', 'Phaladīpikā 16.4');
    out.push(t.build('spirituality', 'Spirit', 'Is there a strong pull towards spiritual life?', 'Yes, the pull is strong', 'No, life stays worldly'));
  }

  // ---- Marriage timing ---------------------------------------------------
  {
    const t = new Tally();
    const l7 = lord(7), p7 = pl(l7);
    if (p7) {
      if (DUSTHANA.includes(p7.house)) t.add('b', 2.5, 'seventh lord in a duḥsthāna — marriage is delayed', 'Phaladīpikā 16.19');
      if (p7.isCombust) t.add('b', 1.5, 'seventh lord combust — the match comes late', 'Phaladīpikā 10.9');
      if (dig(p7.dignity) > 0) t.add('a', 2, 'seventh lord strong — marriage comes in its time', 'Phaladīpikā 16.20');
    }
    if (occ(7).includes('saturn')) t.add('b', 2, 'Saturn in the seventh — late and serious', 'Phaladīpikā 19.13');
    if (occ(7).includes('jupiter')) t.add('a', 1.5, 'Jupiter in the seventh — timely and sanctioned', 'Phaladīpikā 10.7');
    if (chart.planets.venus.isCombust) t.add('b', 1, 'Venus combust — the kāraka is weakened', 'Phaladīpikā 10.9');
    out.push(t.build('marriage-timing', 'Marriage', 'Marriage — early or late?', 'Early', 'Late'));
  }

  // ---- Partnership -------------------------------------------------------
  {
    const t = new Tally();
    const l7 = lord(7), p7 = pl(l7);
    if (p7 && dig(p7.dignity) > 0) t.add('a', 2.5, 'seventh lord strong — you work well with others', 'Phaladīpikā 16.20');
    if (p7 && DUSTHANA.includes(p7.house)) t.add('b', 2, 'seventh lord in a duḥsthāna — partners become liabilities', 'Phaladīpikā 16.19');
    if (occ(7).some((o) => MALEFICS.includes(o))) t.add('b', 2, 'malefics in the seventh — friction with partners', 'Phaladīpikā 10.15');
    if (occ(7).some((o) => BENEFICS.includes(o))) t.add('a', 1.5, 'benefics in the seventh — partners help', 'Phaladīpikā 10.7');
    out.push(t.build('partnership', 'Business', 'Work alone, or with partners?', 'With partners', 'Alone'));
  }

  return out;
}
