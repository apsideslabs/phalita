import type { DashaActivation, HouseSnapshot, PlanetRelationship, VargaSnapshot } from './types';

export const STANDARD_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
const SIGN_LORDS: Record<number, string> = {
  1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun', 6: 'mercury',
  7: 'venus', 8: 'mars', 9: 'jupiter', 10: 'saturn', 11: 'saturn', 12: 'jupiter',
};
const SIGN_NAMES: Record<number, string> = {
  1: 'Meṣa', 2: 'Vṛṣabha', 3: 'Mithuna', 4: 'Karkaṭa', 5: 'Siṃha', 6: 'Kanyā',
  7: 'Tulā', 8: 'Vṛścika', 9: 'Dhanu', 10: 'Makara', 11: 'Kumbha', 12: 'Mīna',
};
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];
const UPACHAYA = [3, 6, 10, 11];
const MARAKA = [2, 7];

export type AnyRecord = Record<string, any>;
const isRecord = (x: unknown): x is AnyRecord => !!x && typeof x === 'object' && !Array.isArray(x);
const n = (x: unknown): number | undefined => typeof x === 'number' && Number.isFinite(x) ? x : undefined;
const str = (x: unknown): string | undefined => typeof x === 'string' && x.trim() ? x : undefined;
const int = (x: unknown): number | undefined => {
  const v = n(x);
  return v !== undefined && Number.isInteger(v) ? v : undefined;
};
const unique = <T>(xs: T[]) => Array.from(new Set(xs));
const inRangeHouse = (v: unknown): v is number => Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 12;

export interface ChartModel {
  raw: AnyRecord;
  planets: Record<string, AnyRecord>;
  houseSnapshots: HouseSnapshot[];
  planetIds: string[];
  lagnaSign?: number;
  moonSign?: number;
  moonPhase: 'waxing' | 'waning' | 'unknown';
  mercuryAssociations: string[];
  ownedHouses: Record<string, number[]>;
  functionalRoles: Record<string, string[]>;
  naturalNature: Record<string, string>;
  planetRelationships: PlanetRelationship[];
  diagnostics: {
    issues: string[];
    warnings: string[];
    missingCoreFields: string[];
    houseSystem?: string;
  };
}

function natureOf(planetId: string, chart: AnyRecord, planets: Record<string, AnyRecord>): string {
  if (['sun', 'mars', 'saturn', 'rahu', 'ketu', 'true_rahu', 'true_ketu'].includes(planetId)) return 'natural_malefic_baseline';
  if (['jupiter', 'venus'].includes(planetId)) return 'natural_benefic_baseline';
  if (planetId === 'moon') {
    const paksha = String(chart?.panchanga?.tithi?.paksha ?? '').toLowerCase();
    if (paksha.includes('shukla') || paksha.includes('wax')) return 'moon_waxing_conditionally_benefic';
    if (paksha.includes('krishna') || paksha.includes('wan')) return 'moon_waning_conditionally_malefic';
    return 'moon_phase_unknown';
  }
  if (planetId === 'mercury') {
    const house = int(planets.mercury?.house);
    if (house === undefined) return 'mercury_association_unknown';
    const associates = Object.entries(planets)
      .filter(([id, p]) => id !== 'mercury' && int(p?.house) === house)
      .map(([id]) => id);
    const malefic = associates.some((id) => ['sun', 'mars', 'saturn', 'rahu', 'ketu', 'true_rahu', 'true_ketu'].includes(id));
    const benefic = associates.some((id) => ['jupiter', 'venus'].includes(id));
    if (malefic && benefic) return 'mercury_mixed_associations';
    if (malefic) return 'mercury_associated_with_natural_malefic';
    if (benefic) return 'mercury_associated_with_natural_benefic';
    return 'mercury_association_unresolved';
  }
  return 'nature_not_defined';
}

export function buildChartModel(input: unknown): ChartModel {
  const chart: AnyRecord = isRecord(input) ? input : {};
  const issues: string[] = [];
  const warnings: string[] = [];
  const missingCoreFields: string[] = [];
  if (!isRecord(input)) issues.push('Chart input must be a non-null object.');
  if (!isRecord(chart.planets)) issues.push('chart.planets is missing or is not an object.');
  const rawPlanets = isRecord(chart.planets) ? chart.planets : {};
  const planets: Record<string, AnyRecord> = {};
  for (const id of Object.keys(rawPlanets)) if (isRecord(rawPlanets[id])) planets[id] = rawPlanets[id];
  const planetIds = unique([...STANDARD_PLANETS.filter((id) => !!planets[id]), ...Object.keys(planets)]);

  const lagnaSign = int(chart.lagna?.rashiNumber);
  const moonSign = int(planets.moon?.rashiNumber);
  if (!inRangeHouse(lagnaSign)) missingCoreFields.push('lagna.rashiNumber');
  if (!inRangeHouse(moonSign)) missingCoreFields.push('planets.moon.rashiNumber');
  if (!str(chart.meta?.houseSystem)) {
    missingCoreFields.push('meta.houseSystem');
    warnings.push('House system is not specified; bhāva-based and rāśi-based predicates must not be treated as interchangeable.');
  }
  for (const id of STANDARD_PLANETS) {
    if (!isRecord(rawPlanets[id])) missingCoreFields.push(`planets.${id}`);
    else {
      if (!inRangeHouse(int(rawPlanets[id].rashiNumber))) missingCoreFields.push(`planets.${id}.rashiNumber`);
      if (!inRangeHouse(int(rawPlanets[id].house))) missingCoreFields.push(`planets.${id}.house`);
    }
  }
  if (!isRecord(chart.meta?.birthDetails)) {
    warnings.push('Birth details are incomplete; age-based interpretation is unavailable.');
  } else {
    const birth = chart.meta.birthDetails;
    for (const field of ['year', 'month', 'day', 'hour', 'minute', 'second', 'latitude', 'longitude', 'timezoneOffsetHours']) {
      if (typeof birth[field] !== 'number' || !Number.isFinite(birth[field])) warnings.push(`Birth metadata field ${field} is missing; dependent timing/calculation checks remain unavailable.`);
    }
  }
  if (!Array.isArray(chart.bhavas) || chart.bhavas.length < 12) missingCoreFields.push('bhavas[0..11]');

  const houseSystem = str(chart.meta?.houseSystem);
  const bhavas = Array.isArray(chart.bhavas) ? chart.bhavas : [];
  const houseSnapshots: HouseSnapshot[] = [];
  const ownedHouses: Record<string, number[]> = {};
  const functionalRoles: Record<string, string[]> = {};

  for (const id of planetIds) { ownedHouses[id] = []; functionalRoles[id] = [];
    const pHouse = int(planets[id]?.house);
    if (pHouse !== undefined && !inRangeHouse(pHouse)) issues.push(`Planet ${id} has invalid house value ${pHouse}; house-based predicates will treat it as unavailable.`);
    const pSign = int(planets[id]?.rashiNumber);
    if (pSign !== undefined && !inRangeHouse(pSign)) issues.push(`Planet ${id} has invalid rāśi value ${pSign}; sign-based predicates will treat it as unavailable.`);
  }
  for (let house = 1; house <= 12; house++) {
    const h = isRecord(bhavas[house - 1]) ? bhavas[house - 1] : {};
    let sign = int(h.rashiNumber);
    let signDerived = false;
    if (!inRangeHouse(sign) && houseSystem === 'equal_whole' && inRangeHouse(lagnaSign)) {
      sign = (((lagnaSign! - 1 + house - 1) % 12) + 1);
      signDerived = true;
    }
    let lord = str(h.rashiLord);
    const lordDerived = !lord && inRangeHouse(sign);
    if (!lord && inRangeHouse(sign)) lord = SIGN_LORDS[sign!];
    if (lord && ownedHouses[lord]) ownedHouses[lord].push(house);

    const fromHouseList = Array.isArray(h.planetsInHouse)
      ? h.planetsInHouse.filter((x: unknown): x is string => typeof x === 'string')
      : undefined;
    const fromPlanetHouse = planetIds.filter((id) => inRangeHouse(int(planets[id]?.house)) && int(planets[id]?.house) === house);
    const occupants = unique([...(fromHouseList ?? []), ...fromPlanetHouse]);
    const occupantsKnown = Array.isArray(h.planetsInHouse) || STANDARD_PLANETS.every((id) => planetIds.includes(id) && inRangeHouse(int(planets[id]?.house)));
    const aspectsKnown = STANDARD_PLANETS.every((id) => planetIds.includes(id) && Array.isArray(planets[id]?.aspectsToHouses));
    const dataWarnings: string[] = [];
    if (fromHouseList && fromPlanetHouse.some((id) => !fromHouseList.includes(id))) {
      dataWarnings.push('Planet.house and bhava.planetsInHouse disagree; occupants are shown as the union pending chart-source reconciliation.');
      warnings.push(`House ${house}: planet.house and bhava.planetsInHouse disagree.`);
    }
    if (signDerived) dataWarnings.push('House sign derived from Lagna under equal_whole; not a separately supplied cusp value.');
    if (lordDerived) dataWarnings.push('House lord derived from the supplied sign ruler; it was not separately supplied as bhava.rashiLord.');
    if (!lord) dataWarnings.push('House lord unavailable.');
    if (!occupantsKnown) dataWarnings.push('House occupants unavailable.');
    if (!aspectsKnown) dataWarnings.push('House aspect data unavailable.');
    if (int(h.houseNumber) !== undefined && int(h.houseNumber) !== house) dataWarnings.push(`Array position ${house} conflicts with houseNumber ${h.houseNumber}.`);

    const aspectsReceived = unique(planetIds.filter((id) => {
      const arr = planets[id]?.aspectsToHouses;
      return Array.isArray(arr) && arr.includes(house) && int(planets[id]?.house) !== house;
    }));
    const savIndex = inRangeHouse(sign) ? sign! - 1 : undefined;
    const savArray = chart.ashtakavarga?.sav?.bindusByRashi;
    const savBindus = Array.isArray(savArray) && savIndex !== undefined ? n(savArray[savIndex]) : undefined;
    const savMapping = savBindus === undefined
      ? 'unavailable'
      : houseSystem === 'equal_whole'
        ? 'whole_sign_house'
        : 'cusp_sign_only';
    houseSnapshots.push({
      house, sign: inRangeHouse(sign) ? sign : undefined,
      signName: inRangeHouse(sign) ? SIGN_NAMES[sign!] : undefined,
      lord, lordPlacement: lord ? int(planets[lord]?.house) : undefined,
      lordDignity: lord ? str(planets[lord]?.dignity) : undefined,
      lordRetrograde: lord ? (typeof planets[lord]?.isRetrograde === 'boolean' ? planets[lord].isRetrograde : undefined) : undefined,
      lordCombust: lord ? (typeof planets[lord]?.isCombust === 'boolean' ? planets[lord].isCombust : undefined) : undefined,
      occupants, aspectsReceived, savBindus, savMapping, dataWarnings, occupantsKnown, aspectsKnown,
    });
  }

  for (const id of planetIds) {
    const owned = ownedHouses[id] ?? [];
    const roles = functionalRoles[id] ?? [];
    if (owned.some((h) => KENDRA.includes(h))) roles.push('lord_of_kendra');
    if (owned.some((h) => TRIKONA.includes(h))) roles.push('lord_of_trikona');
    if (owned.some((h) => DUSTHANA.includes(h))) roles.push('lord_of_dusthana');
    if (owned.some((h) => UPACHAYA.includes(h))) roles.push('lord_of_upachaya');
    if (owned.some((h) => MARAKA.includes(h))) roles.push('lord_of_maraka_house');
    functionalRoles[id] = unique(roles);
  }

  const moonPhase = (() => {
    const paksha = String(chart.panchanga?.tithi?.paksha ?? '').toLowerCase();
    if (paksha.includes('shukla') || paksha.includes('wax')) return 'waxing' as const;
    if (paksha.includes('krishna') || paksha.includes('wan')) return 'waning' as const;
    return 'unknown' as const;
  })();
  const mercuryHouse = int(planets.mercury?.house);
  const mercuryAssociations = mercuryHouse === undefined
    ? []
    : planetIds.filter((id) => id !== 'mercury' && int(planets[id]?.house) === mercuryHouse);
  const naturalNature: Record<string, string> = {};
  for (const id of planetIds) naturalNature[id] = natureOf(id, chart, planets);
  const planetRelationships: PlanetRelationship[] = [];
  for (let i = 0; i < planetIds.length; i++) {
    const a = planetIds[i];
    const pa = planets[a];
    const aHouse = int(pa?.house);
    const aSign = int(pa?.rashiNumber);
    for (let j = i + 1; j < planetIds.length; j++) {
      const b = planetIds[j];
      const pb = planets[b];
      const bHouse = int(pb?.house);
      const bSign = int(pb?.rashiNumber);
      if (aHouse !== undefined && aHouse === bHouse) planetRelationships.push({ kind: 'same_house', from: a, to: b, house: aHouse, basis: 'Both supplied D1 house placements are equal; conjunction is house-based, not orb-based.' });
      if (aSign !== undefined && aSign === bSign) planetRelationships.push({ kind: 'same_sign', from: a, to: b, sign: aSign, basis: 'Both supplied D1 rāśi placements are equal.' });
      if (aHouse !== undefined && bHouse !== undefined && aHouse !== bHouse && Array.isArray(pa?.aspectsToHouses) && pa.aspectsToHouses.includes(bHouse)) planetRelationships.push({ kind: 'aspects_planet', from: a, to: b, house: bHouse, basis: 'Source chart aspect list places the target planet’s house in the aspect set.' });
      if (aHouse !== undefined && bHouse !== undefined && aHouse !== bHouse && Array.isArray(pb?.aspectsToHouses) && pb.aspectsToHouses.includes(aHouse)) planetRelationships.push({ kind: 'aspects_planet', from: b, to: a, house: aHouse, basis: 'Source chart aspect list places the target planet’s house in the aspect set.' });
      if (aSign !== undefined && bSign !== undefined && SIGN_LORDS[aSign] === b && SIGN_LORDS[bSign] === a) planetRelationships.push({ kind: 'mutual_sign_exchange', from: a, to: b, basis: 'Each planet occupies a sign ruled by the other planet, using the engine sign-ruler table.' });
    }
    if (aSign !== undefined && SIGN_LORDS[aSign] && planets[SIGN_LORDS[aSign]]) planetRelationships.push({ kind: 'dispositor_link', from: a, to: SIGN_LORDS[aSign], sign: aSign, basis: 'Planet is placed in a sign whose ruler is the target planet.' });
  }

  if (missingCoreFields.length) warnings.push(`Core fields missing: ${missingCoreFields.join(', ')}. Dependent dimensions will remain unavailable.`);
  return {
    raw: chart, planets, houseSnapshots, planetIds, lagnaSign: inRangeHouse(lagnaSign) ? lagnaSign : undefined,
    moonSign: inRangeHouse(moonSign) ? moonSign : undefined, moonPhase, mercuryAssociations,
    ownedHouses, functionalRoles, naturalNature, planetRelationships,
    diagnostics: { issues, warnings: unique(warnings), missingCoreFields, houseSystem },
  };
}

export function getPath(root: unknown, path: string): { found: boolean; value?: unknown } {
  if (!path || typeof path !== 'string') return { found: false };
  const parts = path.split('.');
  let cur: any = root;
  for (const part of parts) {
    if (!part || cur === null || cur === undefined) return { found: false };
    if (Array.isArray(cur) && /^\d+$/.test(part)) {
      const i = Number(part);
      if (i >= cur.length || !(i in cur)) return { found: false };
      cur = cur[i];
    } else if (isRecord(cur) && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = cur[part];
    } else return { found: false };
  }
  if (cur === undefined || cur === null) return { found: false };
  return { found: true, value: cur };
}

export function activeDashaPath(chart: AnyRecord, referenceDate: Date, relevantLords: string[] = []): DashaActivation[] {
  const tree = chart?.vimshottari?.tree;
  if (!Array.isArray(tree)) return [];
  const now = referenceDate.getTime();
  const out: DashaActivation[] = [];
  const walk = (periods: unknown[], level: number, parentActive: boolean) => {
    for (const item of periods) {
      if (!isRecord(item) || typeof item.lord !== 'string') continue;
      const start = parseDate(item.startDate);
      const end = parseDate(item.endDate);
      if (start === undefined || end === undefined || end <= start) continue;
      const intervalActive = now >= start && now < end;
      const activeNow = parentActive && intervalActive;
      const connected = relevantLords.includes(item.lord);
      const startDate = new Date(start).toISOString();
      const endDate = new Date(end).toISOString();
      if (activeNow || (end > now && connected)) {
        out.push({ level, lord: item.lord, startDate, endDate, activeNow, connectedToDomain: connected, connection: connected ? 'period lord owns or signifies a profile house/domain kāraka' : 'timing context only; no direct domain-lord match' });
      }
      if (Array.isArray(item.subPeriods)) walk(item.subPeriods, level + 1, activeNow);
    }
  };
  walk(tree, 1, true);
  return out.sort((a, b) => Number(b.activeNow) - Number(a.activeNow) || a.level - b.level || a.startDate.localeCompare(b.startDate));
}

function parseDate(value: unknown): number | undefined {
  if (typeof value !== 'string' && !(value instanceof Date)) return undefined;
  const t = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(t) ? t : undefined;
}

export function vargaSnapshot(chart: AnyRecord, id: string, focusHouses: number[] = []): VargaSnapshot {
  const v = chart?.vargas?.[id];
  if (!isRecord(v) || !isRecord(v.planets)) return { id, placements: {}, focusHouses: {}, available: false };
  const placements: VargaSnapshot['placements'] = {};
  for (const [planet, p] of Object.entries(v.planets)) {
    if (!isRecord(p)) continue;
    placements[planet] = { sign: int(p.rashiNumber), house: int(p.house), dignity: str(p.dignity) };
  }
  const houses: VargaSnapshot['focusHouses'] = {};
  for (const h of focusHouses) {
    const sign = int(v.houses?.[h]?.rashiNumber) ?? (inRangeHouse(v.lagnaRashi) ? (((v.lagnaRashi - 1 + h - 1) % 12) + 1) : undefined);
    const lord = str(v.houses?.[h]?.lord) ?? (sign ? SIGN_LORDS[sign] : undefined);
    const occupants = Object.entries(v.planets).filter(([, p]) => isRecord(p) && int(p.house) === h).map(([id]) => id);
    houses[h] = { sign, lord, occupants };
  }
  const hasUsablePlacement = Object.values(placements).some((p) => inRangeHouse(p.sign) || inRangeHouse(p.house));
  const hasUsableLagna = inRangeHouse(int(v.lagnaRashi));
  return { id, lagnaSign: hasUsableLagna ? int(v.lagnaRashi) : undefined, placements, focusHouses: houses, available: hasUsablePlacement || hasUsableLagna };
}
