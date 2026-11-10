/**
 * PHALITA — weighing and conflict resolution.
 *
 * A reading is not a list of verses that happened to fire. Two rules can speak
 * to the same matter and disagree, and the texts themselves say which voice
 * wins: a cancellation beats the affliction it cancels, a specific condition
 * beats a general disposition, and between two conditions the stronger graha
 * carries the verdict.
 *
 * This module makes that explicit. Every claim is weighed from the chart — not
 * from an opinion about the chart — and the weight is broken into the factors
 * that produced it, so a verdict can be argued with line by line.
 *
 * The weights themselves are PHALITA's protocol, not a quotation. No verse
 * gives a planet's dignity a numeric score. What the texts do give is the
 * hierarchy — cancellation over affliction, specific over general, stronger
 * graha over weaker — and these numbers are one faithful way to compute it.
 * They are published here so they can be changed.
 */

import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import type { PhalaStatement } from './types';
import { applyNichabhanga } from './nichabhanga';

export type Theme =
  | 'character'
  | 'body'
  | 'wealth'
  | 'siblings'
  | 'home'
  | 'children'
  | 'health'
  | 'marriage'
  | 'longevity'
  | 'fortune'
  | 'career'
  | 'gains'
  | 'loss'
  | 'yoga';

export interface WeightFactor {
  label: string;
  delta: number;
}

export interface Claim {
  id: string;
  theme: Theme;
  verseId: string;
  short: string;
  phala: string;
  polarity: 'shubha' | 'ashubha';
  /** The graha the rule turns on — the one whose strength decides the weight. */
  hinge?: PlanetId;
  kind: 'condition' | 'cancellation';
  /** For a cancellation: the claim id it overrides. */
  cancels?: string;
  /** 3 = an exact condition of the text, 2 = a general statement, 1 = a disposition. */
  scope: number;
  /**
   * How much the statement claims. A 'fatal' reading — loss of a spouse, death,
   * childlessness — is never pronounced from one condition: the gate in
   * resolveTheme withholds it unless a second condition of the same text
   * corroborates it.
   */
  severity?: 'mild' | 'serious' | 'fatal';
}

export interface WeighedClaim extends Claim {
  weight: number;
  basis: WeightFactor[];
}

export interface Verdict {
  theme: Theme;
  net: 'shubha' | 'ashubha' | 'balanced' | 'none' | 'withheld';
  /** Margin between the winning and losing sides, 0–100. */
  confidence: number;
  winner?: WeighedClaim;
  losers: WeighedClaim[];
  cancelled: { claim: WeighedClaim; by: WeighedClaim }[];
  /** The chain of reasoning, in order, as sentences. */
  reasoning: string[];
}

const DIGNITY_DELTA: Record<string, number> = {
  'Exalted (Ucca)': 22,
  Moolatrikona: 16,
  'Own Sign (Swakshetra)': 14,
  'Great Friend (Adhi Mitra)': 8,
  'Friend (Mitra)': 6,
  'Neutral (Sama)': 0,
  'Enemy (Shatru)': -8,
  'Great Enemy (Adhi Shatru)': -12,
  'Debilitated (Neecha)': -20,
};

const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

/**
 * Weigh one claim from the chart. Every delta is recorded, so the verdict can
 * be read as an argument rather than a score.
 */
export function weighClaim(chart: JyotishaChart, claim: Claim): WeighedClaim {
  const basis: WeightFactor[] = [{ label: 'base weight of a stated condition', delta: 50 }];
  let weight = 50;

  const hinge = claim.hinge;
  if (hinge) {
    const p = chart.planets[hinge];
    const name = GRAHA_PROPERTIES[hinge]?.name ?? hinge;

    const dd = DIGNITY_DELTA[p.dignity] ?? 0;
    basis.push({ label: `${name} in ${p.dignity}`, delta: dd });
    weight += dd;

    // Ṣaḍbala, relative to the mean of the seven grahas: ±15 at the extremes.
    const sb = chart.shadbala as unknown as Record<string, { totalVirupas?: number }>;
    const seven: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const vals = seven.map((g) => sb[g]?.totalVirupas ?? 0).filter((v) => v > 0);
    const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const mine = sb[hinge]?.totalVirupas ?? 0;
    if (mean > 0 && mine > 0) {
      const ratio = (mine - mean) / mean; // -1..+1 typical
      const sd = Math.max(-15, Math.min(15, Math.round(ratio * 60)));
      basis.push({
        label: `ṣaḍbala ${mine.toFixed(0)} v against a mean of ${mean.toFixed(0)} v`,
        delta: sd,
      });
      weight += sd;
    }

    // Dṛṣṭi on the graha: benefic aspect strengthens, malefic weakens.
    const aspected = (ids: PlanetId[]) =>
      (Object.values(chart.planets) as { id: PlanetId; aspectsToHouses: number[] }[]).filter(
        (pl) => ids.includes(pl.id) && (pl.aspectsToHouses ?? []).includes(p.house)
      ).length;
    const bAspect = aspected(BENEFICS);
    const mAspect = aspected(MALEFICS);
    if (bAspect) {
      const d = Math.min(12, bAspect * 6);
      basis.push({ label: `benefic dṛṣṭi on ${name} (${bAspect})`, delta: d });
      weight += d;
    }
    if (mAspect) {
      const d = -Math.min(12, mAspect * 6);
      basis.push({ label: `malefic dṛṣṭi on ${name} (${mAspect})`, delta: d });
      weight += d;
    }

    if (p.isCombust) {
      basis.push({ label: `${name} is combust`, delta: -8 });
      weight -= 8;
    }
    if (p.isRetrograde) {
      basis.push({ label: `${name} is retrograde (9.20 gives it its exaltation phala)`, delta: 6 });
      weight += 6;
    }
  }

  // A cancellation carries the authority the texts give it: it is not a
  // competing opinion, it is the rule that says the other rule does not apply.
  if (claim.kind === 'cancellation') {
    basis.push({ label: 'a cancellation rule — it removes the reading it names', delta: 40 });
    weight += 40;
  }

  // Specificity: an exact condition outranks a disposition.
  const scopeDelta = (claim.scope - 2) * 8;
  if (scopeDelta !== 0) {
    basis.push({
      label: claim.scope >= 3 ? 'an exact condition of the text' : 'a general disposition',
      delta: scopeDelta,
    });
    weight += scopeDelta;
  }

  weight = Math.max(0, Math.min(100, weight));
  return { ...claim, weight, basis };
}

/**
 * Resolve the claims for one theme into a single verdict, keeping every losing
 * and cancelled claim visible.
 */
export function resolveTheme(theme: Theme, claims: Claim[], chart: JyotishaChart): Verdict {
  // Nīchabhanga first: a debilitated graha whose fall the text cancels must not
  // be weighed down and left there.
  const augmented = applyNichabhanga(chart, claims);
  const weighed = augmented.map((c) => weighClaim(chart, c));
  const reasoning: string[] = [];

  // 1. Cancellations remove what they name.
  const cancelled: Verdict['cancelled'] = [];
  const removed = new Set<string>();
  for (const c of weighed.filter((w) => w.kind === 'cancellation' && w.cancels)) {
    const target = weighed.find((w) => w.id === c.cancels);
    if (target && !removed.has(target.id)) {
      removed.add(target.id);
      cancelled.push({ claim: target, by: c });
      reasoning.push(
        `${c.short} cancels ${target.short}: the text gives the cancellation the last word, so that reading is withdrawn rather than averaged.`
      );
    }
  }

  const live = weighed.filter((w) => !removed.has(w.id) && w.kind !== 'cancellation');
  if (live.length === 0) {
    return { theme, net: 'none', confidence: 0, losers: [], cancelled, reasoning };
  }

  // 2. Split by polarity and compare the strongest of each side.
  const byPolarity = (p: 'shubha' | 'ashubha') =>
    live.filter((c) => c.polarity === p).sort((a, b) => b.weight - a.weight);
  const good = byPolarity('shubha');
  const bad = byPolarity('ashubha');

  if (good.length && bad.length) {
    const g = good[0];
    const b = bad[0];
    const margin = Math.abs(g.weight - b.weight);
    const winner = g.weight >= b.weight ? g : b;
    const loser = g.weight >= b.weight ? b : g;
    reasoning.push(
      `Two readings oppose each other. ${winner.short} weighs ${winner.weight} against ${loser.weight} for ${loser.short}, because ${winner.basis
        .filter((f) => f.delta !== 0)
        .slice(0, 3)
        .map((f) => `${f.label} (${f.delta > 0 ? '+' : ''}${f.delta})`)
        .join(', ')}.`
    );
    reasoning.push(
      margin < 8
        ? 'The margin is small, so the text is read as giving a mixed result rather than a clear one.'
        : `${winner.short} prevails, and ${loser.short} is reported as outweighed rather than deleted.`
    );
    return {
      theme,
      net: margin < 8 ? 'balanced' : winner.polarity,
      confidence: Math.min(100, margin * 2),
      winner,
      losers: [loser, ...good.slice(1), ...bad.slice(1)].filter((c) => c !== winner),
      cancelled,
      reasoning,
    };
  }

  const only = good.length ? good : bad;
  const top = only[0];

  // A fatal reading needs corroboration. One condition of one verse is a
  // warning, not a verdict — and a verdict of "loss of spouse" from a single
  // affliction is exactly the kind of line that does damage.
  if (top.severity === 'fatal' && only.filter((c) => c.polarity === top.polarity).length < 2) {
    reasoning.push(
      `${top.short} names a grave outcome, but it is a single condition. The text gives other conditions in the same chapter that contradict it, and none of them held here. This platform does not turn one affliction into a verdict of loss, so the reading is withheld rather than pronounced.`
    );
    return {
      theme,
      net: 'withheld',
      confidence: 0,
      // No winner and no losers: a withheld reading must not render as
      // "Follow: ..." anywhere. The verse stays visible among the statements
      // as a condition that fired; it does not become the verdict.
      winner: undefined,
      losers: [],
      cancelled,
      reasoning,
    };
  }
  reasoning.push(
    only.length === 1
      ? `One reading applies here: ${top.short} (weight ${top.weight}).`
      : `${only.length} readings agree in direction; the strongest, ${top.short}, carries weight ${top.weight}.`
  );
  return {
    theme,
    net: top.polarity,
    confidence: Math.min(100, Math.round(top.weight / 2)),
    winner: top,
    losers: only.slice(1),
    cancelled,
    reasoning,
  };
}

/** Group the statements of a section into claims by theme. */
export function claimsFromStatements(
  statements: PhalaStatement[],
  themeOf: (s: PhalaStatement) => Theme
): Claim[] {
  return statements.map((s, i) => ({
    id: `${s.citation.verseId}#${i}`,
    theme: themeOf(s),
    verseId: s.citation.verseId,
    short: s.citation.short,
    phala: s.phala,
    polarity: s.tone === 'ashubha' ? 'ashubha' : 'shubha',
    kind: (s.modifiedBy ?? []).some((m) => m.effect === 'obstructed') ? 'cancellation' : 'condition',
    scope: s.keywords.length > 0 ? 3 : 2,
  }));
}

/**
 * Build the verdicts for one section straight from its statements.
 *
 * Kept here rather than in the reading builder so the panel can resolve a
 * section on its own: the workspace file does not have to change for the
 * verdict layer to reach the screen.
 */
const BHAVA_THEME: Record<string, Theme> = {
  'phaladipika.16.4': 'body',
  'phaladipika.16.5': 'wealth',
  'phaladipika.16.8': 'siblings',
  'phaladipika.16.13': 'home',
  'phaladipika.16.14': 'home',
  'phaladipika.16.15': 'children',
  'phaladipika.16.17': 'health',
  'phaladipika.16.18': 'health',
  'phaladipika.16.19': 'loss',
  'phaladipika.16.20': 'marriage',
  'phaladipika.16.21': 'longevity',
  'phaladipika.16.27': 'career',
  'phaladipika.16.28': 'career',
  'phaladipika.16.29': 'gains',
};

const BHAVA_HOUSE: Record<string, number> = {
  'phaladipika.16.4': 1,
  'phaladipika.16.5': 2,
  'phaladipika.16.8': 3,
  'phaladipika.16.13': 4,
  'phaladipika.16.14': 4,
  'phaladipika.16.15': 5,
  'phaladipika.16.17': 6,
  'phaladipika.16.18': 6,
  'phaladipika.16.19': 6,
  'phaladipika.16.20': 7,
  'phaladipika.16.21': 8,
  'phaladipika.16.27': 10,
  'phaladipika.16.28': 10,
  'phaladipika.16.29': 11,
};

export function buildVerdicts(
  chart: JyotishaChart,
  sectionId: string,
  statements: PhalaStatement[]
): Verdict[] {
  if (statements.length === 0) return [];

  const lord = (h: number) => chart.bhavas[h - 1]?.rashiLord as PlanetId | undefined;

  if (sectionId === 'bhava') {
    const groups = new Map<Theme, PhalaStatement[]>();
    for (const stm of statements) {
      const th = BHAVA_THEME[stm.citation.verseId] ?? 'body';
      const arr = groups.get(th) ?? [];
      arr.push(stm);
      groups.set(th, arr);
    }
    return [...groups.entries()].map(([th, list]) =>
      resolveTheme(
        th,
        claimsFromStatements(list, () => th).map((c) => ({
          ...c,
          hinge: lord(BHAVA_HOUSE[c.verseId] ?? 1),
        })),
        chart
      )
    );
  }

  if (sectionId === 'vivaha') {
    const claims = claimsFromStatements(statements, () => 'marriage' as Theme).map((c) => ({
      ...c,
      hinge: lord(7),
    }));
    // The grave readings of this chapter are tagged fatal, so the gate applies.
    for (const c of claims) {
      if (c.verseId === 'phaladipika.10.15' || c.verseId === 'phaladipika.10.2') {
        c.severity = 'fatal';
      }
    }

    // The chapter argues with itself, and its own counter-verses withdraw the
    // grave reading outright: a strong benefic seventh lord (10.6), a seventh
    // lord free of the Sun's burning (10.9), the lagna lord in the seventh
    // (10.13) and benefic company on the seventh (10.7) all contradict it.
    // Where any of those hold, kalatra-hāni is not the reading.
    const grave = claims.find(
      (c) => c.verseId === 'phaladipika.10.15' || c.verseId === 'phaladipika.10.2'
    );
    if (grave) {
      for (const vid of ['phaladipika.10.7', 'phaladipika.10.6', 'phaladipika.10.9', 'phaladipika.10.13']) {
        const counter = claims.find((c) => c.verseId === vid);
        if (counter) {
          counter.kind = 'cancellation';
          counter.cancels = grave.id;
        }
      }
    }
    return [resolveTheme('marriage', claims, chart)];
  }

  if (sectionId === 'svabhava') {
    return [
      resolveTheme(
        'character',
        claimsFromStatements(statements, () => 'character' as Theme).map((c) => ({
          ...c,
          hinge: lord(1),
        })),
        chart
      ),
    ];
  }

  if (sectionId === 'yogas') {
    return [
      resolveTheme(
        'yoga',
        claimsFromStatements(statements, () => 'yoga' as Theme).map((c) => ({
          ...c,
          hinge: lord(1),
        })),
        chart
      ),
    ];
  }

  return [];
}
