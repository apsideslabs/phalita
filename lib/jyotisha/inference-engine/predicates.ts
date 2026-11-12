import type { ClassicalRule, RuleEvaluation, RulePredicate, RuleTraceItem, RulePackDiagnostics, RulePackIssue, TruthValue } from './types';
import { getPath, type ChartModel } from './chart-model';

interface PredicateResult { truth: TruthValue; observed?: unknown; explanation: string; }
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

function compare(op: string, actual: unknown, expected: unknown): TruthValue {
  if (actual === null || actual === undefined) return 'unknown';
  switch (op) {
    case 'eq': return actual === expected ? 'true' : 'false';
    case 'neq': return actual !== expected ? 'true' : 'false';
    case 'gt': return typeof actual === 'number' && typeof expected === 'number' ? (actual > expected ? 'true' : 'false') : 'unknown';
    case 'gte': return typeof actual === 'number' && typeof expected === 'number' ? (actual >= expected ? 'true' : 'false') : 'unknown';
    case 'lt': return typeof actual === 'number' && typeof expected === 'number' ? (actual < expected ? 'true' : 'false') : 'unknown';
    case 'lte': return typeof actual === 'number' && typeof expected === 'number' ? (actual <= expected ? 'true' : 'false') : 'unknown';
    case 'in': return Array.isArray(expected) ? (expected.includes(actual) ? 'true' : 'false') : 'unknown';
    case 'contains':
      return Array.isArray(actual) ? (actual.includes(expected) ? 'true' : 'false')
        : typeof actual === 'string' && typeof expected === 'string' ? (actual.includes(expected) ? 'true' : 'false') : 'unknown';
    default: return 'unknown';
  }
}

export function evaluatePredicate(predicate: RulePredicate, model: ChartModel): PredicateResult {
  if (!isObj(predicate) || typeof predicate.op !== 'string') return { truth: 'unknown', explanation: 'Malformed predicate.' };
  if (predicate.op === 'all' || predicate.op === 'any') {
    if (!Array.isArray(predicate.items) || predicate.items.length === 0) return { truth: 'unknown', explanation: `${predicate.op} requires one or more child predicates.` };
    const children = predicate.items.map((p) => evaluatePredicate(p, model));
    const truth: TruthValue = predicate.op === 'all'
      ? (children.some((x) => x.truth === 'false') ? 'false' : children.every((x) => x.truth === 'true') ? 'true' : 'unknown')
      : (children.some((x) => x.truth === 'true') ? 'true' : children.every((x) => x.truth === 'false') ? 'false' : 'unknown');
    return { truth, observed: children.map((x) => x.truth), explanation: `${predicate.op.toUpperCase()}(${children.map((x) => x.truth).join(', ')})` };
  }
  if (predicate.op === 'not') {
    const inner = evaluatePredicate(predicate.item, model);
    return { truth: inner.truth === 'true' ? 'false' : inner.truth === 'false' ? 'true' : 'unknown', observed: inner.truth, explanation: `NOT(${inner.explanation})` };
  }
  if (predicate.op === 'planet_in_house') {
    const p = model.planets[predicate.planet];
    const h = typeof p?.house === 'number' && Number.isInteger(p.house) && p.house >= 1 && p.house <= 12 ? p.house : undefined;
    return h === undefined
      ? { truth: 'unknown', explanation: `${predicate.planet}.house is unavailable.` }
      : { truth: h === predicate.house ? 'true' : 'false', observed: h, explanation: `${predicate.planet} is in house ${h}; expected ${predicate.house}.` };
  }
  if (predicate.op === 'aspects_house') {
    const p = model.planets[predicate.planet];
    const aspects = p?.aspectsToHouses;
    if (!Array.isArray(aspects)) return { truth: 'unknown', explanation: `${predicate.planet}.aspectsToHouses is unavailable.` };
    return { truth: aspects.includes(predicate.house) ? 'true' : 'false', observed: aspects, explanation: `${predicate.planet} aspect list ${aspects.includes(predicate.house) ? 'includes' : 'does not include'} house ${predicate.house}.` };
  }
  if (predicate.op === 'planets_in_same_house') {
    const a = model.planets[predicate.planetA];
    const b = model.planets[predicate.planetB];
    const ah = typeof a?.house === 'number' && Number.isInteger(a.house) && a.house >= 1 && a.house <= 12 ? a.house : undefined;
    const bh = typeof b?.house === 'number' && Number.isInteger(b.house) && b.house >= 1 && b.house <= 12 ? b.house : undefined;
    if (ah === undefined || bh === undefined) return { truth: 'unknown', explanation: `House placement for ${predicate.planetA} or ${predicate.planetB} is unavailable.` };
    const truth = ah === bh;
    return { truth: truth ? 'true' : 'false', observed: { [predicate.planetA]: ah, [predicate.planetB]: bh }, explanation: `${predicate.planetA} is in H${ah} and ${predicate.planetB} is in H${bh}; same house: ${truth}.` };
  }
  if (predicate.op === 'planet_in_relative_house') {
    const p = model.planets[predicate.planet];
    const ref = model.planets[predicate.referencePlanet];
    const field = predicate.countFrom === 'rashi' ? 'rashiNumber' : 'house';
    const a = typeof p?.[field] === 'number' && Number.isInteger(p[field]) && p[field] >= 1 && p[field] <= 12 ? p[field] : undefined;
    const b = typeof ref?.[field] === 'number' && Number.isInteger(ref[field]) && ref[field] >= 1 && ref[field] <= 12 ? ref[field] : undefined;
    if (a === undefined || b === undefined) return { truth: 'unknown', explanation: `${field} for ${predicate.planet} or ${predicate.referencePlanet} is unavailable.` };
    const relative = ((a - b + 12) % 12) + 1;
    const truth = relative === predicate.relativeHouse;
    return { truth: truth ? 'true' : 'false', observed: relative, explanation: `${predicate.planet} is ${relative}th from ${predicate.referencePlanet} counted by ${predicate.countFrom}; expected ${predicate.relativeHouse}.` };
  }
  if (predicate.op === 'planet_aspects_planet') {
    const p = model.planets[predicate.planet];
    const target = model.planets[predicate.targetPlanet];
    const aspects = p?.aspectsToHouses;
    const targetHouse = typeof target?.house === 'number' && Number.isInteger(target.house) ? target.house : undefined;
    if (!Array.isArray(aspects) || targetHouse === undefined) return { truth: 'unknown', explanation: `Aspect list for ${predicate.planet} or house placement for ${predicate.targetPlanet} is unavailable.` };
    const truth = aspects.includes(targetHouse);
    return { truth: truth ? 'true' : 'false', observed: { aspects, targetHouse }, explanation: `${predicate.planet} ${truth ? 'aspects' : 'does not aspect'} ${predicate.targetPlanet} by the supplied house-aspect model.` };
  }
  if (predicate.op === 'planet_in_varga_house') {
    const placement = model.raw?.vargas?.[predicate.varga]?.planets?.[predicate.planet];
    const house = typeof placement?.house === 'number' && Number.isInteger(placement.house) ? placement.house : undefined;
    if (house === undefined) return { truth: 'unknown', explanation: `${predicate.varga} placement for ${predicate.planet} is unavailable.` };
    const truth = house === predicate.house;
    return { truth: truth ? 'true' : 'false', observed: house, explanation: `${predicate.planet} is in ${predicate.varga} house ${house}; expected ${predicate.house}.` };
  }
  if (predicate.op === 'house_has_nature_occupant' || predicate.op === 'house_aspected_by_nature') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house) return { truth: 'unknown', explanation: `House ${predicate.house} is unavailable.` };
    const known = predicate.op === 'house_has_nature_occupant' ? house.occupantsKnown : house.aspectsKnown;
    if (!known) return { truth: 'unknown', explanation: `${predicate.op === 'house_has_nature_occupant' ? 'Occupants' : 'Aspect'} data for house ${predicate.house} is unavailable.` };
    const ids = predicate.op === 'house_has_nature_occupant' ? house.occupants : house.aspectsReceived;
    const matching = ids.filter((id) => model.naturalNature[id] === predicate.nature);
    const truth = matching.length > 0;
    return { truth: truth ? 'true' : 'false', observed: matching, explanation: `${predicate.op === 'house_has_nature_occupant' ? 'Occupants' : 'Aspecting planets'} of nature ${predicate.nature} in house ${predicate.house}: ${matching.join(', ') || 'none'}.` };
  }

  if (predicate.op === 'house_lord_in_relative_house') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house?.lord) return { truth: 'unknown', explanation: `Lord of house ${predicate.house} is unavailable.` };
    const lord = model.planets[house.lord];
    const from = predicate.countFrom === 'rashi' ? house.sign : predicate.house;
    const target = predicate.countFrom === 'rashi' ? lord?.rashiNumber : lord?.house;
    if (!Number.isInteger(from) || !Number.isInteger(target)) return { truth: 'unknown', explanation: `The ${predicate.countFrom} reference or placement of lord ${house.lord} is unavailable.` };
    const relative = ((Number(target) - Number(from) + 12) % 12) + 1;
    const truth = relative === predicate.relativeHouse;
    return { truth: truth ? 'true' : 'false', observed: relative, explanation: `Lord ${house.lord} of H${predicate.house} is ${relative}th from its reference counted by ${predicate.countFrom}; expected ${predicate.relativeHouse}.` };
  }
  if (predicate.op === 'house_lord_has_dignity') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house?.lord) return { truth: 'unknown', explanation: `Lord of house ${predicate.house} is unavailable.` };
    const dignity = model.planets[house.lord]?.dignity;
    if (typeof dignity !== 'string') return { truth: 'unknown', explanation: `Dignity of lord ${house.lord} is unavailable.` };
    const truth = predicate.dignities.includes(dignity);
    return { truth: truth ? 'true' : 'false', observed: dignity, explanation: `Lord ${house.lord} of H${predicate.house} has dignity ${dignity}; expected one of [${predicate.dignities.join(', ')}].` };
  }
  if (predicate.op === 'house_lord_shadbala_at_least') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house?.lord) return { truth: 'unknown', explanation: `Lord of house ${predicate.house} is unavailable.` };
    const ratio = model.raw.shadbala?.[house.lord]?.ratio;
    if (typeof ratio !== 'number' || !Number.isFinite(ratio)) return { truth: 'unknown', explanation: `Ṣaḍbala ratio of lord ${house.lord} is unavailable.` };
    const truth = ratio >= predicate.minimumRatio;
    return { truth: truth ? 'true' : 'false', observed: ratio, explanation: `Lord ${house.lord} of H${predicate.house} has ṣaḍbala ratio ${ratio}; required minimum ${predicate.minimumRatio}.` };
  }
  if (predicate.op === 'house_has_occupant') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house) return { truth: 'unknown', explanation: `House ${predicate.house} is unavailable.` };
    if (!house.occupantsKnown) return { truth: 'unknown', explanation: `Occupant list for H${predicate.house} is incomplete.` };
    const truth = house.occupants.includes(predicate.planet);
    return { truth: truth ? 'true' : 'false', observed: house.occupants, explanation: `${predicate.planet} ${truth ? 'occupies' : 'does not occupy'} H${predicate.house} in the supplied chart model.` };
  }
  if (predicate.op === 'planet_in_sign') {
    const sign = model.planets[predicate.planet]?.rashiNumber;
    if (!Number.isInteger(sign) || Number(sign) < 1 || Number(sign) > 12) return { truth: 'unknown', explanation: `Rāśi placement for ${predicate.planet} is unavailable.` };
    const truth = sign === predicate.sign;
    return { truth: truth ? 'true' : 'false', observed: sign, explanation: `${predicate.planet} is in sign ${sign}; expected sign ${predicate.sign}.` };
  }
  if (predicate.op === 'planet_in_varga_sign') {
    const sign = model.raw?.vargas?.[predicate.varga]?.planets?.[predicate.planet]?.rashiNumber;
    if (!Number.isInteger(sign) || sign < 1 || sign > 12) return { truth: 'unknown', explanation: `${predicate.planet} sign in ${predicate.varga} is unavailable.` };
    const truth = sign === predicate.sign;
    return { truth: truth ? 'true' : 'false', observed: sign, explanation: `${predicate.planet} is in sign ${sign} in ${predicate.varga}; expected ${predicate.sign}.` };
  }
  if (predicate.op === 'house_lord_aspected_by_nature') {
    const house = model.houseSnapshots[predicate.house - 1];
    if (!house?.lord) return { truth: 'unknown', explanation: `Lord of house ${predicate.house} is unavailable.` };
    const lordHouse = model.planets[house.lord]?.house;
    if (!Number.isInteger(lordHouse) || Number(lordHouse) < 1 || Number(lordHouse) > 12) return { truth: 'unknown', explanation: `House placement of lord ${house.lord} is unavailable.` };
    const sourcePlanets = Object.keys(model.planets);
    const observed = sourcePlanets.filter((id) => model.planets[id]?.aspectsToHouses?.includes(Number(lordHouse)) && model.planets[id]?.house !== Number(lordHouse) && model.naturalNature[id] === predicate.nature);
    const complete = sourcePlanets.length >= 9 && sourcePlanets.every((id) => Array.isArray(model.planets[id]?.aspectsToHouses));
    if (observed.length) return { truth: 'true', observed, explanation: `The lord of H${predicate.house} receives ${predicate.nature} aspect from ${observed.join(', ')}.` };
    return complete
      ? { truth: 'false', observed: [], explanation: `No supplied planet with nature ${predicate.nature} aspects the house occupied by lord ${house.lord}.` }
      : { truth: 'unknown', explanation: `Aspect lists are incomplete; absence of ${predicate.nature} aspect on lord ${house.lord} cannot be established.` };
  }
  if ('path' in predicate && typeof predicate.path === 'string') {
    const root = { chart: model.raw, model };
    const found = getPath(root, predicate.path);
    if (predicate.op === 'exists') return { truth: found.found ? 'true' : 'unknown', observed: found.found ? found.value : undefined, explanation: found.found ? `${predicate.path} is explicitly present.` : `${predicate.path} is missing; availability is unknown, not evidence of absence.` };
    if (!found.found) return { truth: 'unknown', explanation: `${predicate.path} is missing; missing data is unknown, not false.` };
    const truth = compare(predicate.op, found.value, (predicate as any).value);
    return { truth, observed: found.value, explanation: `${predicate.path} ${predicate.op} ${(predicate as any).value}: ${truth}.` };
  }
  return { truth: 'unknown', explanation: 'Unsupported predicate shape.' };
}

export function evaluateClassicalRule(rule: ClassicalRule, model: ChartModel): RuleEvaluation {
  const trace: RuleTraceItem[] = rule.conditions.map((condition) => {
    const role = condition.role ?? 'required';
    const result = evaluatePredicate(condition.predicate, model);
    return { conditionId: condition.id, label: condition.label, role, factKeys: condition.factKeys ?? [], result: result.truth, observed: result.observed, explanation: result.explanation };
  });
  const required = trace.filter((x) => x.role === 'required');
  const corroborators = trace.filter((x) => x.role === 'corroborating');
  const exceptions = trace.filter((x) => x.role === 'exception');
  const matchedRequired = required.filter((x) => x.result === 'true').length;
  const matchedCorroborators = corroborators.filter((x) => x.result === 'true').length;
  const matchedExceptions = exceptions.filter((x) => x.result === 'true').length;
  const minCorroborators = Math.max(0, rule.minimumCorroboratingConditions ?? 0);
  const requiredFailure = required.some((x) => x.result === 'false');
  const requiredUnknown = required.some((x) => x.result === 'unknown');
  const exceptionUnknown = exceptions.some((x) => x.result === 'unknown');
  const enoughCorroborators = matchedCorroborators >= minCorroborators;
  const corroboratorCanStillPass = matchedCorroborators + corroborators.filter((x) => x.result === 'unknown').length >= minCorroborators;
  const satisfiedFactConditions = trace.filter((x) => x.result === 'true' && x.role !== 'exception' && x.factKeys.length > 0);
  const independentFactKeys = Array.from(new Set(satisfiedFactConditions.flatMap((x) => x.factKeys)));
  // A single composite predicate cannot certify itself as two corroborating
  // conditions merely by listing two labels. Require at least two independently
  // evaluated, satisfied condition records and two distinct underlying facts.
  const independentConditionCount = new Set(satisfiedFactConditions.map((x) => x.conditionId)).size;
  const seriousNeedsIndependentEvidence = rule.severity === 'serious'
    && (independentFactKeys.length < 2 || independentConditionCount < 2);

  let status: RuleEvaluation['status'];
  if (rule.conditions.length === 0 || required.length === 0) status = 'incomplete';
  else if (requiredFailure) status = 'not_satisfied';
  else if (requiredUnknown || exceptionUnknown || (!enoughCorroborators && corroboratorCanStillPass)) status = 'incomplete';
  else if (matchedExceptions > 0) status = 'exception_applies';
  else if (seriousNeedsIndependentEvidence) status = 'incomplete';
  else if (!enoughCorroborators) status = 'not_satisfied';
  else status = 'satisfied';

  return {
    ruleId: rule.id, domainId: rule.domainId, hypothesisId: rule.hypothesisId, hypothesisTitle: rule.hypothesisTitle, title: rule.title, status,
    polarity: rule.polarity, evidenceClass: rule.evidenceClass, source: rule.source, corroboratingSources: rule.corroboratingSources,
    correlationGroup: rule.correlationGroup, factKeys: rule.factKeys,
    trace, matchedRequired, totalRequired: required.length,
    matchedCorroborators, totalCorroborators: corroborators.length,
    matchedExceptions, independentFactKeys, severity: rule.severity, interpretation: rule.interpretation,
    caveat: seriousNeedsIndependentEvidence ? 'Serious conclusions require at least two separately evaluated satisfied conditions with distinct, explicitly declared chart fact keys. This rule did not meet that gate.' : rule.caveat,
  };
}

function sourceIsVerified(source: ClassicalRule['source']): boolean {
  return source.transcriptionStatus === 'edition_verified'
    && (source.translationStatus === 'edition_verified' || source.translationStatus === 'not_applicable');
}

/**
 * Validate the rule pack before evaluation. Invalid definitions remain visible
 * in diagnostics and are forced to `incomplete`; they cannot create evidence.
 */
export function validateRulePack(rules: ClassicalRule[]): RulePackDiagnostics {
  const issues: RulePackIssue[] = [];
  const seen = new Set<string>();
  let invalidRules = 0;
  for (const rule of rules) {
    const before = issues.length;
    if (!rule.id?.trim()) issues.push({ ruleId: rule.id, code: 'missing_rule_id', message: 'Rule id must be non-empty.', severity: 'error' });
    if (seen.has(rule.id)) issues.push({ ruleId: rule.id, code: 'duplicate_rule_id', message: 'Rule ids must be unique within a rule pack.', severity: 'error' });
    seen.add(rule.id);
    if (!rule.domainId?.trim()) issues.push({ ruleId: rule.id, code: 'missing_domain', message: 'Every rule must identify a domain.', severity: 'error' });
    if (!rule.title?.trim()) issues.push({ ruleId: rule.id, code: 'missing_title', message: 'Every rule must have a readable title.', severity: 'error' });
    if (!rule.correlationGroup?.trim()) issues.push({ ruleId: rule.id, code: 'missing_correlation_group', message: 'Every rule must declare a stable correlationGroup.', severity: 'error' });
    if (!Array.isArray(rule.factKeys) || rule.factKeys.length === 0 || rule.factKeys.some((x) => !x?.trim())) issues.push({ ruleId: rule.id, code: 'missing_fact_keys', message: 'Every rule must declare at least one non-empty underlying chart fact key.', severity: 'error' });
    if (!Array.isArray(rule.conditions) || rule.conditions.length === 0 || !rule.conditions.some((c) => (c.role ?? 'required') === 'required')) issues.push({ ruleId: rule.id, code: 'missing_required_conditions', message: 'A rule must have at least one required condition; empty rules cannot auto-fire.', severity: 'error' });
    if (rule.conditions && new Set(rule.conditions.map((c) => c.id)).size !== rule.conditions.length) issues.push({ ruleId: rule.id, code: 'duplicate_condition_id', message: 'Condition ids must be unique within a rule.', severity: 'error' });
    if (rule.evidenceClass !== 'modern_heuristic' && !sourceIsVerified(rule.source)) issues.push({ ruleId: rule.id, code: 'text_source_not_edition_verified', message: 'The primary text source has not passed edition-level transcription and translation review; this rule may be traced but cannot support classical synthesis.', severity: 'warning' });
    if (rule.severity === 'serious') {
      const independent = new Set(rule.conditions.filter((c) => (c.role ?? 'required') !== 'exception').flatMap((c) => c.factKeys ?? []));
      if (independent.size < 2) issues.push({ ruleId: rule.id, code: 'serious_rule_needs_two_fact_keys', message: 'Serious rules must declare at least two distinct factKeys across at least two conditions; runtime evaluation then requires at least two separately evaluated conditions and both distinct facts to be satisfied.', severity: 'error' });
    }
    if (rule.evidenceClass === 'cross_text_corroboration') {
      const sources = [rule.source, ...(rule.corroboratingSources ?? [])];
      const independentIds = new Set(sources.map((x) => x.id).filter((x) => typeof x === 'string' && x.trim()));
      if (independentIds.size < 2) issues.push({ ruleId: rule.id, code: 'cross_text_needs_two_sources', message: 'Cross-text corroboration requires at least two distinct, named source records.', severity: 'error' });
      if (sources.some((x) => !sourceIsVerified(x))) issues.push({ ruleId: rule.id, code: 'cross_text_source_unverified', message: 'Every source used for cross-text corroboration must have its transcription and translation/reading reviewed.', severity: 'warning' });
    }
    if (issues.slice(before).some((x) => x.severity === 'error')) invalidRules++;
  }
  return { suppliedRules: rules.length, validRules: rules.length - invalidRules, invalidRules, issues };
}

export function evaluateRulePack(rules: ClassicalRule[], model: ChartModel): RuleEvaluation[] {
  const diagnostics = validateRulePack(rules);
  const invalidIds = new Set(diagnostics.issues.filter((x) => x.severity === 'error' && x.ruleId).map((x) => x.ruleId));
  return rules.map((rule) => {
    const result = evaluateClassicalRule(rule, model);
    return invalidIds.has(rule.id) ? {
      ...result, status: 'incomplete' as const,
      caveat: [result.caveat, 'Rule-pack validation failed; this rule is visible for repair but cannot create evidence.'].filter(Boolean).join(' '),
    } : result;
  });
}
