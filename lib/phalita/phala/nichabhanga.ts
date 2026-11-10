/**
 * PHALITA — nīchabhanga, the cancellation of debilitation (Phaladīpikā 7.26–7.30).
 *
 * The text's rule: a graha in its debilitation is restored when
 *
 *   the lord of the sign it is debilitated in, or
 *   the lord of the sign of its exaltation,
 *
 * stands in a kendra — from the lagna or from the Moon (7.26 names both).
 *
 * Without this the engine could weigh a debilitated planet down and leave it
 * there, which is the most common complaint against a rule-by-rule reading.
 * Every cancellation names the verse and the graha that carried it.
 */

import type { JyotishaChart, PlanetId, RashiNumber } from '@/lib/jyotisha/types';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import type { Claim } from './resolve';

const KENDRA = [1, 4, 7, 10];

export interface Nichabhanga {
  graha: PlanetId;
  debilitationSign: RashiNumber;
  carrier: PlanetId;
  from: 'lagna' | 'Moon';
  verseId: string;
  detail: string;
}

/** The lord of a sign, read off the whole-sign bhāvas. */
function signLord(chart: JyotishaChart, sign: number): PlanetId | undefined {
  const b = chart.bhavas.find((x) => x.rashiNumber === sign);
  return b?.rashiLord as PlanetId | undefined;
}

function houseFromMoon(chart: JyotishaChart, p: PlanetId): number {
  const moon = chart.planets.moon.rashiNumber;
  return (((chart.planets[p].rashiNumber - moon + 12) % 12) + 1);
}

/** Every cancellation of debilitation this chart supports. */
export function findNichabhanga(chart: JyotishaChart): Nichabhanga[] {
  const out: Nichabhanga[] = [];
  // The seven grahas only: the nodes have no exaltation sign in the classical
  // texts, so 7.26's rule has nothing to operate on for them.
  const planets: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  for (const p of planets) {
    const planet = chart.planets[p];
    if (!planet || planet.dignity !== 'Debilitated (Neecha)') continue;

    const debSign = planet.rashiNumber;
    const exaltSign = GRAHA_PROPERTIES[p]?.exaltationSign as RashiNumber | undefined;

    const candidates: { lord?: PlanetId; role: string }[] = [
      { lord: signLord(chart, debSign), role: 'the lord of the sign it falls in' },
      {
        lord: exaltSign ? signLord(chart, exaltSign) : undefined,
        role: 'the lord of its exaltation sign',
      },
    ];

    for (const { lord, role } of candidates) {
      if (!lord || lord === p) continue;
      const inKendraLagna = KENDRA.includes(chart.planets[lord].house);
      const inKendraMoon = KENDRA.includes(houseFromMoon(chart, lord));
      if (!inKendraLagna && !inKendraMoon) continue;

      out.push({
        graha: p,
        debilitationSign: debSign,
        carrier: lord,
        from: inKendraLagna ? 'lagna' : 'Moon',
        verseId: 'phaladipika.7.26',
        detail: `${GRAHA_PROPERTIES[p]?.name ?? p} is debilitated in ${
          planet.rashiName
        }, but ${GRAHA_PROPERTIES[lord]?.name ?? lord} — ${role} — stands in a kendra from the ${
          inKendraLagna ? 'lagna' : 'Moon'
        }. The text cancels the fall (nīchabhanga).`,
      });
    }
  }

  return out;
}

/**
 * Add a cancellation claim for every claim whose hinge graha is debilitated but
 * rescued. The original claim is left in place; resolveTheme withdraws it and
 * keeps it visible.
 */
export function applyNichabhanga(chart: JyotishaChart, claims: Claim[]): Claim[] {
  const bhanga = findNichabhanga(chart);
  if (bhanga.length === 0) return claims;

  const extra: Claim[] = [];
  for (const claim of claims) {
    if (!claim.hinge) continue;
    const hit = bhanga.find((b) => b.graha === claim.hinge);
    if (!hit) continue;
    extra.push({
      id: `nichabhanga#${claim.id}`,
      theme: claim.theme,
      verseId: hit.verseId,
      short: 'Phaladīpikā 7.26',
      phala: hit.detail,
      polarity: 'shubha',
      hinge: hit.carrier,
      kind: 'cancellation',
      cancels: claim.id,
      scope: 3,
    });
  }

  return [...claims, ...extra];
}
