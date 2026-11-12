import type {
  AnalyzeOptions, ClassicalRule, DomainAnalysis, DomainDimensions, DomainProfile,
  EvidenceItem, InferenceReport, RuleEvaluation,
} from './types';
import { buildChartModel, activeDashaPath, vargaSnapshot } from './chart-model';
import { evaluateRulePack, validateRulePack } from './predicates';
import { synthesizeEvidence } from './fusion';
import { DEFAULT_DOMAIN_PROFILES } from './profiles';
import { adaptLegacyReading } from './legacy-adapter';

const unique = <T>(x: T[]) => Array.from(new Set(x));
const asDate = (v?: Date | string) => {
  const date = v instanceof Date ? new Date(v.getTime()) : v ? new Date(v) : new Date();
  return { date: Number.isFinite(date.getTime()) ? date : new Date(0), invalidInput: v !== undefined && !Number.isFinite(date.getTime()) };
};

function dimensionsFor(profile: DomainProfile, model: ReturnType<typeof buildChartModel>, referenceDate: Date): DomainDimensions {
  const houses = profile.houses.map((h) => model.houseSnapshots[h - 1]).filter(Boolean);
  const relevantIds = unique([
    ...houses.map((h) => h.lord).filter((x): x is string => !!x),
    ...houses.flatMap((h) => [...h.occupants, ...h.aspectsReceived]),
    ...profile.naturalKarakas,
  ]);
  const planetRelationships = model.planetRelationships.filter((r) => relevantIds.includes(r.from) || relevantIds.includes(r.to));
  const karakas: DomainDimensions['karakas'] = {};
  for (const id of profile.naturalKarakas) {
    const p = model.planets[id];
    const sb = model.raw.shadbala?.[id];
    karakas[id] = {
      dignity: typeof p?.dignity === 'string' ? p.dignity : undefined,
      house: Number.isInteger(p?.house) ? p.house : undefined,
      shadbalaRupas: Number.isFinite(sb?.totalRupas) ? sb.totalRupas : undefined,
      shadbalaRatio: Number.isFinite(sb?.ratio) ? sb.ratio : undefined,
      naturalNature: model.naturalNature[id] ?? 'unavailable',
      functionalHouses: model.ownedHouses[id] ?? [],
      functionalRoles: model.functionalRoles[id] ?? [],
    };
  }
  const vargas = profile.vargas.map((id) => vargaSnapshot(model.raw, id, profile.vargaFocusHouses ?? [1, 4, 7, 10]));
  const relevantLords = unique([
    ...houses.map((h) => h.lord).filter((x): x is string => !!x),
    ...profile.naturalKarakas,
  ]);
  const dashaActivations = activeDashaPath(model.raw, referenceDate, relevantLords);

  const chartFacts: string[] = [];
  const missingDimensions: string[] = [];
  for (const h of houses) {
    chartFacts.push(`H${h.house}: ${h.lord ? `lord ${h.lord}` : 'lord unavailable'}${h.lordPlacement ? ` in H${h.lordPlacement}` : ''}; occupants ${h.occupants.join(', ') || (h.occupantsKnown ? 'none recorded' : 'unknown')}; aspects received ${h.aspectsReceived.join(', ') || (h.aspectsKnown ? 'none recorded' : 'unknown')}${h.savBindus === undefined ? '' : `; SAV ${h.savBindus} (${h.savMapping ?? 'mapping unknown'})`}.`);
    if (!h.lord) missingDimensions.push(`H${h.house} lord`);
    if (h.dataWarnings.length) missingDimensions.push(...h.dataWarnings.map((x) => `H${h.house}: ${x}`));
    if (h.savBindus === undefined) missingDimensions.push(`H${h.house} SAV (sign-based) unavailable`);
    else if (h.savMapping === 'cusp_sign_only') missingDimensions.push(`H${h.house} SAV is the bindu count of the cusp sign only; it is not a whole-sign house mapping under ${model.diagnostics.houseSystem ?? 'the selected system'}`);
  }
  for (const id of profile.naturalKarakas) {
    if (!model.planets[id]) missingDimensions.push(`${id} natural kāraka placement`);
    if (!Number.isFinite(model.raw.shadbala?.[id]?.ratio)) missingDimensions.push(`${id} ṣaḍbala ratio`);
  }
  for (const v of vargas) if (!v.available) missingDimensions.push(`${v.id} unavailable`);
  if (profile.vargas.includes('D60') && model.raw.meta?.birthDetails?.birthTimeAccuracyMinutes === undefined) {
    missingDimensions.push('D60 birth-time accuracy/rectification metadata unavailable; retain D60 as a computed chart layer but do not treat its sensitivity as verified');
  }
  if (!Array.isArray(model.raw.vimshottari?.tree)) missingDimensions.push('Viṃśottarī daśā tree unavailable');
  if (!dashaActivations.some((x) => x.activeNow)) missingDimensions.push('No active daśā period could be resolved for reference date');

  return { houses, planetRelationships, karakas, vargas, dashaActivations, chartFacts, missingDimensions: unique(missingDimensions) };
}

function ruleEvidence(rule: RuleEvaluation): EvidenceItem | undefined {
  if (rule.status === 'not_satisfied' || rule.status === 'incomplete') return undefined;
  const isException = rule.status === 'exception_applies';
  const restricted = rule.policyRestricted === true;
  const textual = rule.evidenceClass === 'direct_textual' || rule.evidenceClass === 'cross_text_corroboration' || rule.evidenceClass === 'disputed_textual';
  const sourceRecords = [rule.source, ...(rule.corroboratingSources ?? [])];
  const sourcesVerified = sourceRecords.every((source) => source.transcriptionStatus === 'edition_verified'
    && (source.translationStatus === 'edition_verified' || source.translationStatus === 'not_applicable'));
  const hasIndependentCrossTextSources = rule.evidenceClass !== 'cross_text_corroboration'
    || new Set(sourceRecords.map((source) => source.id)).size >= 2;
  const sourceVerified = sourcesVerified && hasIndependentCrossTextSources;
  const eligible = !textual || sourceVerified;
  return {
    id: `rule:${rule.ruleId}`,
    domainId: rule.domainId,
    hypothesisId: rule.hypothesisId,
    hypothesisTitle: rule.hypothesisTitle,
    title: rule.title,
    detail: restricted
      ? 'The registered conditions were met, but this is a high-sensitivity domain. The engine retains the condition trace for symbolic audit and suppresses an event-level conclusion.'
      : isException
        ? `An explicitly registered exception condition applies. This modifies the rule; it is not automatically converted into an opposite prediction.`
        : rule.interpretation ?? `All required conditions passed (${rule.matchedRequired}/${rule.totalRequired}); corroborators ${rule.matchedCorroborators}/${rule.totalCorroborators}.`,
    polarity: isException ? 'neutral' : rule.polarity,
    evidenceClass: rule.evidenceClass,
    reviewStatus: rule.source.transcriptionStatus,
    source: rule.source,
    corroboratingSources: rule.corroboratingSources,
    ruleId: rule.ruleId,
    correlationGroup: rule.correlationGroup,
    factKeys: rule.factKeys,
    kind: isException ? 'modifier' : 'rule',
    status: isException ? 'modifies' : (restricted || !eligible) ? 'unverified' : 'active',
    severity: rule.severity,
    caveat: [rule.caveat, restricted ? 'High-sensitivity policy: no deterministic diagnosis, fertility, legal, confinement, injury, accident or death outcome is emitted.' : undefined, (!eligible && textual) ? 'Excluded from synthesis because the source transcription/translation has not passed the required verification gate.' : undefined].filter(Boolean).join(' '),
  };
}

function profilesWithRuleDomains(profiles: DomainProfile[], rules: ClassicalRule[]): DomainProfile[] {
  const out = profiles.slice();
  const known = new Set(out.map((p) => p.id));
  for (const rule of rules) {
    if (known.has(rule.domainId)) continue;
    out.push({
      id: rule.domainId, title: rule.domainId.replace(/[_-]/g, ' '), houses: [], naturalKarakas: [], vargas: [],
      mappingNote: 'Custom rule domain. No default house/karaka/varga routing was inferred.',
    });
    known.add(rule.domainId);
  }
  return out;
}

/** Analyze any GAṆAKA-compatible chart without injecting default planetary data. */
export function analyzeChart(input: unknown, options: AnalyzeOptions = {}): InferenceReport {
  const resolvedDate = asDate(options.referenceDate);
  const referenceDate = resolvedDate.date;
  const model = buildChartModel(input);
  const rules = options.rules ?? [];
  const rulePackDiagnostics = validateRulePack(rules);
  const profiles = profilesWithRuleDomains(options.profiles ?? DEFAULT_DOMAIN_PROFILES, rules);
  const restrictedDomains = new Set(profiles.filter((p) => p.sensitivity === 'high_sensitivity').map((p) => p.id));
  const evaluations = evaluateRulePack(rules, model).map((result) => {
    const restricted = result.severity === 'high_sensitivity' || restrictedDomains.has(result.domainId);
    return restricted ? {
      ...result, policyRestricted: true, interpretation: undefined,
      caveat: [result.caveat, 'High-sensitivity policy suppresses event-level output; condition traces are retained for symbolic audit only.'].filter(Boolean).join(' '),
    } : result;
  });
  const legacyEvidence = options.legacyReading ? adaptLegacyReading(options.legacyReading, profiles) : [];
  const evidence: EvidenceItem[] = [
    ...evaluations.map(ruleEvidence).filter((x): x is EvidenceItem => !!x),
    ...legacyEvidence,
  ];

  const domains: DomainAnalysis[] = profiles.map((profile) => {
    const domainRules = evaluations.filter((r) => r.domainId === profile.id);
    const domainEvidence = evidence.filter((e) => e.domainId === profile.id);
    const dimensions = dimensionsFor(profile, model, referenceDate);
    const synthesis = synthesizeEvidence(domainEvidence, dimensions.missingDimensions);
    return {
      id: profile.id, title: profile.title, mappingNote: profile.mappingNote,
      sensitivity: profile.sensitivity ?? 'ordinary', dimensions,
      ruleEvaluations: domainRules, evidence: domainEvidence, synthesis,
    };
  });

  const missingCore = model.diagnostics.missingCoreFields;
  const status = model.diagnostics.issues.length > 0 || !Object.keys(model.planets).length
    ? 'invalid' as const
    : missingCore.length > 0 ? 'partial' as const : 'usable' as const;
  const globalDasha = resolvedDate.invalidInput ? [] : activeDashaPath(model.raw, referenceDate, []);
  const allRoles: InferenceReport['globalContext']['planetRoles'] = {};
  for (const id of model.planetIds) {
    allRoles[id] = {
      naturalNature: model.naturalNature[id] ?? 'unavailable',
      ownedHouses: model.ownedHouses[id] ?? [],
      functionalRoles: model.functionalRoles[id] ?? [],
    };
  }
  const warnings = unique([
    ...model.diagnostics.warnings,
    ...(resolvedDate.invalidInput ? ['Invalid referenceDate supplied; daśā timing is disabled for this analysis.'] : []),
    'Natural and functional planetary roles are reported separately; this engine does not collapse them into a single benefic/malefic boolean.',
    'D1 establishes the natal chart frame. Varga placements are shown independently and are not added as duplicate D1 facts.',
    'Daśā periods describe activation candidates, not proof that an event must occur.',
    ...domains.filter((d) => d.sensitivity === 'high_sensitivity').map((d) => `${d.title}: high-sensitivity domain; deterministic health, fertility, legal, confinement, injury or death verdicts are blocked by policy.`),
  ]);

  return {
    engine: { name: 'Phalita Smart Inference Engine', version: '0.2.0', mode: 'evidence_graph', probabilityCalibration: 'not_calibrated' },
    chartDiagnostics: {
      status: resolvedDate.invalidInput ? 'partial' : status, issues: model.diagnostics.issues, warnings: unique([...model.diagnostics.warnings, ...(resolvedDate.invalidInput ? ['Invalid referenceDate supplied; timing results are unavailable.'] : [])]),
      missingCoreFields: unique([...missingCore, ...(resolvedDate.invalidInput ? ['valid referenceDate'] : [])]), houseSystem: model.diagnostics.houseSystem,
      referenceDate: resolvedDate.invalidInput ? 'INVALID_DATE_INPUT' : referenceDate.toISOString(),
    },
    globalContext: {
      lagnaSign: model.lagnaSign, moonSign: model.moonSign, moonPhase: model.moonPhase,
      mercuryAssociations: model.mercuryAssociations,
      planetRelationships: model.planetRelationships,
      planetRoles: allRoles, activeDashaPath: globalDasha,
    },
    domains, ruleEvaluations: evaluations, rulePackDiagnostics, evidence, warnings,
    interpretationPolicy: [
      'A chart fact is not itself a prediction. Only a registered rule with explicit, evaluated conditions can create rule evidence.',
      'Missing or incompatible fields evaluate to unknown; they are never silently replaced with plausible defaults.',
      'A failed rule is not automatically evidence for the opposite outcome.',
      'Exceptions and modifiers are retained as modifiers; they are not turned into independent opposite-polarity votes.',
      'Evidence sharing a correlation group or underlying fact key is counted once in domain synthesis.',
      'Direct textual, cross-text, disputed, modern heuristic and legacy evidence classes remain distinct.',
      'The domain-to-house and varga routing profiles are editorial discovery maps, not source-derived verdict rules.',
      'Support-group counts are not probabilities, certainty levels, nor measured predictive accuracy.',
    'Serious rule conclusions require at least two distinct condition-level fact keys actually satisfied; a duplicated or correlated condition does not meet that gate.',
    'Cross-text corroboration requires two distinct, named source records and verified source status for every cited source.',
    'A supplied invalid reference date disables daśā timing; it does not silently substitute the current date.',
      'High-sensitivity domains do not emit deterministic verdicts.',
    ],
  };
}
