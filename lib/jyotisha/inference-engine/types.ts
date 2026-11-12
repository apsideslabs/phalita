/**
 * Phalita Smart Inference Engine — public contracts.
 *
 * Scores in this package are evidence-accounting aids, never probabilities or
 * claims of empirical astrological validity. Unknown chart inputs stay unknown.
 */

export type TruthValue = 'true' | 'false' | 'unknown';
export type Polarity = 'support' | 'challenge' | 'neutral';
export type EvidenceClass =
  | 'direct_textual'
  | 'cross_text_corroboration'
  | 'disputed_textual'
  | 'modern_heuristic'
  | 'legacy_corpus_statement'
  | 'chart_fact';
export type ReviewStatus =
  | 'edition_verified'
  | 'transcription_unverified'
  | 'translation_review_needed'
  | 'disputed_reading'
  | 'modern_mapping'
  | 'legacy_rule_not_revalidated'
  | 'not_applicable';
export type RuleStatus =
  | 'satisfied'
  | 'not_satisfied'
  | 'incomplete'
  | 'exception_applies';
export type FusionStatus =
  | 'insufficient_evidence'
  | 'single_line_support'
  | 'multi_line_support'
  | 'lean_support'
  | 'contested'
  | 'lean_challenge'
  | 'single_line_challenge'
  | 'multi_line_challenge';

export interface SourceProvenance {
  id: string;
  title: string;
  author?: string;
  edition?: string;
  recension?: string;
  translator?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  textDigest?: string;
  school?: string;
  sourceLanguage?: string;
  page?: string;
  alternativeReadings?: string[];
  chapter?: string | number;
  verse?: string;
  sourceUrl?: string;
  transcriptionStatus: ReviewStatus;
  translationStatus?: ReviewStatus;
  note?: string;
}

export interface Predicate {
  op: 'all' | 'any';
  items: Predicate[];
}
export interface NotPredicate {
  op: 'not';
  item: Predicate;
}
export interface ComparePredicate {
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  path: string;
  value: unknown;
}
export interface ExistsPredicate {
  op: 'exists';
  path: string;
}
export interface PlanetsInSameHousePredicate {
  op: 'planets_in_same_house';
  planetA: string;
  planetB: string;
}
export interface PlanetInRelativeHousePredicate {
  op: 'planet_in_relative_house';
  planet: string;
  referencePlanet: string;
  relativeHouse: number;
  countFrom: 'rashi' | 'bhava';
}
export interface PlanetAspectsPlanetPredicate {
  op: 'planet_aspects_planet';
  planet: string;
  targetPlanet: string;
}
export interface PlanetInVargaHousePredicate {
  op: 'planet_in_varga_house';
  planet: string;
  varga: string;
  house: number;
}
export interface HouseHasNaturePredicate {
  op: 'house_has_nature_occupant' | 'house_aspected_by_nature';
  house: number;
  nature: string;
}
export interface PlanetInHousePredicate {
  op: 'planet_in_house';
  planet: string;
  house: number;
  chart?: 'D1' | string;
}
export interface AspectPredicate {
  op: 'aspects_house';
  planet: string;
  house: number;
}

export interface HouseLordRelativeHousePredicate {
  op: 'house_lord_in_relative_house';
  house: number;
  relativeHouse: number;
  countFrom: 'rashi' | 'bhava';
}
export interface HouseLordDignityPredicate {
  op: 'house_lord_has_dignity';
  house: number;
  dignities: string[];
}
export interface HouseLordStrengthPredicate {
  op: 'house_lord_shadbala_at_least';
  house: number;
  minimumRatio: number;
}
export interface HouseHasOccupantPredicate {
  op: 'house_has_occupant';
  house: number;
  planet: string;
}
export interface PlanetInSignPredicate {
  op: 'planet_in_sign';
  planet: string;
  sign: number;
}
export interface PlanetInVargaSignPredicate {
  op: 'planet_in_varga_sign';
  planet: string;
  varga: string;
  sign: number;
}
export interface HouseLordAspectedByNaturePredicate {
  op: 'house_lord_aspected_by_nature';
  house: number;
  nature: string;
}
export type RulePredicate =
  | Predicate
  | NotPredicate
  | ComparePredicate
  | ExistsPredicate
  | PlanetInHousePredicate
  | AspectPredicate
  | PlanetsInSameHousePredicate
  | PlanetInRelativeHousePredicate
  | PlanetAspectsPlanetPredicate
  | PlanetInVargaHousePredicate
  | HouseHasNaturePredicate
  | HouseLordRelativeHousePredicate
  | HouseLordDignityPredicate
  | HouseLordStrengthPredicate
  | HouseHasOccupantPredicate
  | PlanetInSignPredicate
  | PlanetInVargaSignPredicate
  | HouseLordAspectedByNaturePredicate;

export interface RuleCondition {
  id: string;
  label: string;
  predicate: RulePredicate;
  role?: 'required' | 'corroborating' | 'exception';
  /** Underlying chart facts this condition actually depends on; used for severe-outcome corroboration. */
  factKeys?: string[];
}

export interface ClassicalRule {
  id: string;
  domainId: string;
  /** Separate alternative/outcome being tested, e.g. employment vs enterprise. */
  hypothesisId?: string;
  hypothesisTitle?: string;
  title: string;
  source: SourceProvenance;
  /** Required for cross_text_corroboration: independently reviewed sources beyond `source`. */
  corroboratingSources?: SourceProvenance[];
  polarity: Polarity;
  evidenceClass: Exclude<EvidenceClass, 'chart_fact' | 'legacy_corpus_statement'>;
  /** A stable group for facts that are not independent of one another. */
  correlationGroup: string;
  /** Fact keys are also used to deduplicate overlapping conditions. */
  factKeys: string[];
  conditions: RuleCondition[];
  /** Optional number of corroborating conditions required in addition to required ones. */
  minimumCorroboratingConditions?: number;
  severity?: 'ordinary' | 'serious' | 'high_sensitivity';
  interpretation?: string;
  caveat?: string;
}

export interface RuleTraceItem {
  conditionId: string;
  label: string;
  role: 'required' | 'corroborating' | 'exception';
  factKeys: string[];
  result: TruthValue;
  observed?: unknown;
  explanation: string;
}

export interface RuleEvaluation {
  ruleId: string;
  domainId: string;
  hypothesisId?: string;
  hypothesisTitle?: string;
  title: string;
  status: RuleStatus;
  polarity: Polarity;
  evidenceClass: EvidenceClass;
  source: SourceProvenance;
  corroboratingSources?: SourceProvenance[];
  correlationGroup: string;
  factKeys: string[];
  trace: RuleTraceItem[];
  matchedRequired: number;
  totalRequired: number;
  matchedCorroborators: number;
  totalCorroborators: number;
  matchedExceptions: number;
  independentFactKeys: string[];
  severity?: 'ordinary' | 'serious' | 'high_sensitivity';
  policyRestricted?: boolean;
  interpretation?: string;
  caveat?: string;
}

export interface EvidenceItem {
  id: string;
  domainId: string;
  hypothesisId?: string;
  hypothesisTitle?: string;
  title: string;
  detail: string;
  polarity: Polarity;
  evidenceClass: EvidenceClass;
  reviewStatus: ReviewStatus;
  source?: SourceProvenance;
  corroboratingSources?: SourceProvenance[];
  ruleId?: string;
  correlationGroup: string;
  factKeys: string[];
  kind: 'rule' | 'legacy_statement' | 'modifier';
  status: 'active' | 'modifies' | 'withdrawn' | 'unverified';
  severity?: 'ordinary' | 'serious' | 'high_sensitivity';
  modifiesEvidenceId?: string;
  caveat?: string;
}

export interface DomainProfile {
  id: string;
  title: string;
  houses: number[];
  naturalKarakas: string[];
  vargas: string[];
  vargaFocusHouses?: number[];
  /** Documents that the domain-to-house mapping is an editorial index, not one universal śāstric rule. */
  mappingNote: string;
  sensitivity?: 'ordinary' | 'high_sensitivity';
}

export interface HouseSnapshot {
  house: number;
  sign?: number;
  signName?: string;
  lord?: string;
  lordPlacement?: number;
  lordDignity?: string;
  lordRetrograde?: boolean;
  lordCombust?: boolean;
  occupants: string[];
  aspectsReceived: string[];
  savBindus?: number;
  savMapping?: 'whole_sign_house' | 'cusp_sign_only' | 'unavailable';
  dataWarnings: string[];
  occupantsKnown: boolean;
  aspectsKnown: boolean;
}

export interface PlanetRelationship {
  kind: 'same_house' | 'same_sign' | 'aspects_planet' | 'dispositor_link' | 'mutual_sign_exchange';
  from: string;
  to: string;
  house?: number;
  sign?: number;
  basis: string;
}

export interface VargaSnapshot {
  id: string;
  lagnaSign?: number;
  placements: Record<string, { sign?: number; house?: number; dignity?: string }>;
  focusHouses: Record<number, { sign?: number; lord?: string; occupants: string[] }>;
  available: boolean;
}

export interface DashaActivation {
  level: number;
  lord: string;
  startDate: string;
  endDate: string;
  activeNow: boolean;
  connectedToDomain: boolean;
  connection: string;
}

export interface DomainDimensions {
  houses: HouseSnapshot[];
  planetRelationships: PlanetRelationship[];
  karakas: Record<string, {
    dignity?: string;
    house?: number;
    shadbalaRupas?: number;
    shadbalaRatio?: number;
    naturalNature: string;
    functionalHouses: number[];
    functionalRoles: string[];
  }>;
  vargas: VargaSnapshot[];
  dashaActivations: DashaActivation[];
  chartFacts: string[];
  missingDimensions: string[];
}

export interface CorroborationGroup {
  id: string;
  lane: 'classical' | 'modern' | 'disputed' | 'other';
  hypothesisId?: string;
  evidenceIds: string[];
  polarity: Polarity;
  evidenceClasses: EvidenceClass[];
  independentFactKeys: string[];
  summary: string;
}

export interface HypothesisSynthesis {
  id: string;
  title: string;
  status: FusionStatus;
  supportGroups: number;
  challengeGroups: number;
  corroborationGroups: CorroborationGroup[];
  evidenceIds: string[];
  note: string;
}

export interface DomainSynthesis {
  /** Synthesis of domain-wide evidence only; hypothesis-specific claims are returned separately. */
  status: FusionStatus;
  supportGroups: number;
  challengeGroups: number;
  neutralItems: number;
  corroborationGroups: CorroborationGroup[];
  directTextualCount: number;
  crossTextCount: number;
  disputedCount: number;
  disputedGroups: number;
  modernHeuristicCount: number;
  modernSupportGroups: number;
  modernChallengeGroups: number;
  legacyUnvalidatedCount: number;
  unverifiedCount: number;
  hypotheses: HypothesisSynthesis[];
  missingDimensions: string[];
  note: string;
}

export interface DomainAnalysis {
  id: string;
  title: string;
  mappingNote: string;
  sensitivity: 'ordinary' | 'high_sensitivity';
  dimensions: DomainDimensions;
  ruleEvaluations: RuleEvaluation[];
  evidence: EvidenceItem[];
  synthesis: DomainSynthesis;
}

export interface RulePackIssue {
  ruleId?: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface RulePackDiagnostics {
  suppliedRules: number;
  validRules: number;
  invalidRules: number;
  issues: RulePackIssue[];
}

export interface ChartDiagnostics {
  status: 'invalid' | 'partial' | 'usable';
  issues: string[];
  warnings: string[];
  missingCoreFields: string[];
  houseSystem?: string;
  referenceDate: string;
}

export interface InferenceReport {
  engine: { name: string; version: string; mode: 'evidence_graph'; probabilityCalibration: 'not_calibrated' };
  chartDiagnostics: ChartDiagnostics;
  globalContext: {
    lagnaSign?: number;
    moonSign?: number;
    moonPhase?: 'waxing' | 'waning' | 'unknown';
    mercuryAssociations: string[];
    planetRelationships: PlanetRelationship[];
    planetRoles: Record<string, {
      naturalNature: string;
      ownedHouses: number[];
      functionalRoles: string[];
    }>;
    activeDashaPath: DashaActivation[];
  };
  domains: DomainAnalysis[];
  ruleEvaluations: RuleEvaluation[];
  rulePackDiagnostics: RulePackDiagnostics;
  evidence: EvidenceItem[];
  warnings: string[];
  interpretationPolicy: string[];
}

export interface AnalyzeOptions {
  referenceDate?: Date | string;
  profiles?: DomainProfile[];
  rules?: ClassicalRule[];
  /** Existing `buildReading()` result. It is imported as legacy evidence, not silently treated as fully revalidated. */
  legacyReading?: unknown;
}
