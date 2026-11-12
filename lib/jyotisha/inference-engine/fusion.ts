import type { CorroborationGroup, DomainSynthesis, EvidenceItem, FusionStatus, HypothesisSynthesis } from './types';

function evidenceLane(item: EvidenceItem): CorroborationGroup['lane'] {
  if (item.evidenceClass === 'direct_textual' || item.evidenceClass === 'cross_text_corroboration') return 'classical';
  if (item.evidenceClass === 'modern_heuristic') return 'modern';
  if (item.evidenceClass === 'disputed_textual') return 'disputed';
  return 'other';
}

function intersects(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const set = new Set(a);
  return b.some((x) => set.has(x));
}

/**
 * Build connected components of evidence that share a declared correlation
 * group or an underlying chart fact. Correlated observations count once.
 */
export function groupIndependentEvidence(items: EvidenceItem[]): CorroborationGroup[] {
  const usable = items.filter((item) => item.status === 'active' && item.polarity !== 'neutral');
  const parent = usable.map((_, i) => i);
  const find = (x: number): number => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (a: number, b: number) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent[rb] = ra; };
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      if (evidenceLane(usable[i]) === evidenceLane(usable[j])
        && (usable[i].correlationGroup === usable[j].correlationGroup || intersects(usable[i].factKeys, usable[j].factKeys))) union(i, j);
    }
  }
  const components = new Map<number, EvidenceItem[]>();
  usable.forEach((item, i) => {
    const root = find(i);
    const bucket = components.get(root) ?? [];
    bucket.push(item);
    components.set(root, bucket);
  });
  return Array.from(components.entries()).map(([root, group]) => {
    const polarities = new Set(group.map((x) => x.polarity));
    const polarity = polarities.size === 1 ? group[0].polarity : 'neutral';
    const id = group.map((x) => x.correlationGroup).sort()[0] || `evidence-group-${root}`;
    return {
      id,
      lane: evidenceLane(group[0]),
      hypothesisId: group[0].hypothesisId,
      evidenceIds: group.map((x) => x.id),
      polarity,
      evidenceClasses: Array.from(new Set(group.map((x) => x.evidenceClass))),
      independentFactKeys: Array.from(new Set(group.flatMap((x) => x.factKeys))),
      summary: polarities.size > 1
        ? 'Correlated evidence points in opposing directions; retained as one conflicted group, not counted on both sides.'
        : `${group.length} item(s) share one dependence cluster and count as one independent evidence group.`,
    };
  });
}

interface CoreSynthesis {
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
  note: string;
}

function synthesizeCore(items: EvidenceItem[]): CoreSynthesis {
  const groups = groupIndependentEvidence(items);
  // Only source-verified textual groups drive classical synthesis.
  const classicalGroups = groups.filter((g) => g.lane === 'classical');
  const modernGroups = groups.filter((g) => g.lane === 'modern');
  const disputedGroups = groups.filter((g) => g.lane === 'disputed');
  const supportGroups = classicalGroups.filter((g) => g.polarity === 'support').length;
  const challengeGroups = classicalGroups.filter((g) => g.polarity === 'challenge').length;
  const modernSupportGroups = modernGroups.filter((g) => g.polarity === 'support').length;
  const modernChallengeGroups = modernGroups.filter((g) => g.polarity === 'challenge').length;
  const neutralItems = items.filter((x) => x.polarity === 'neutral' || x.status === 'modifies' || x.status === 'withdrawn').length;
  const directTextualCount = items.filter((x) => x.evidenceClass === 'direct_textual' && x.status === 'active').length;
  const crossTextCount = items.filter((x) => x.evidenceClass === 'cross_text_corroboration' && x.status === 'active').length;
  const disputedCount = items.filter((x) => x.evidenceClass === 'disputed_textual').length;
  const modernHeuristicCount = items.filter((x) => x.evidenceClass === 'modern_heuristic' && x.status === 'active').length;
  const legacyUnvalidatedCount = items.filter((x) => x.evidenceClass === 'legacy_corpus_statement' && x.status === 'unverified').length;
  const unverifiedCount = items.filter((x) => x.status === 'unverified').length;

  let status: FusionStatus = 'insufficient_evidence';
  if (supportGroups === 0 && challengeGroups === 0) status = 'insufficient_evidence';
  else if (supportGroups === challengeGroups) status = 'contested';
  else if (supportGroups > challengeGroups) {
    status = challengeGroups === 0
      ? (supportGroups >= 2 ? 'multi_line_support' : 'single_line_support')
      : 'lean_support';
  } else {
    status = supportGroups === 0
      ? (challengeGroups >= 2 ? 'multi_line_challenge' : 'single_line_challenge')
      : 'lean_challenge';
  }

  const note = status === 'insufficient_evidence'
    ? 'No eligible, independently grouped, source-verified textual rule evidence is available. Modern heuristic groups, disputed readings, chart facts and unvalidated legacy statements are kept separate and do not become a classical verdict.'
    : status === 'contested'
      ? 'Independent rule groups conflict. Both directions remain visible; no winning verdict is forced.'
      : 'This is a count of distinct evidence clusters, not a probability, certainty percentage, or empirical accuracy estimate.';

  return { status, supportGroups, challengeGroups, neutralItems, corroborationGroups: groups,
    directTextualCount, crossTextCount, disputedCount, disputedGroups: disputedGroups.length, modernHeuristicCount,
    modernSupportGroups, modernChallengeGroups, legacyUnvalidatedCount, unverifiedCount, note };
}

/**
 * Synthesize each explicit hypothesis separately. Evidence for mutually
 * exclusive possibilities (e.g. employment and enterprise) must never be
 * collapsed into one support/challenge vote for the whole domain.
 */
export function synthesizeEvidence(items: EvidenceItem[], missingDimensions: string[]): DomainSynthesis {
  const domainItems = items.filter((x) => !x.hypothesisId);
  const core = synthesizeCore(domainItems);
  const byHypothesis = new Map<string, EvidenceItem[]>();
  for (const item of items) {
    if (!item.hypothesisId) continue;
    const bucket = byHypothesis.get(item.hypothesisId) ?? [];
    bucket.push(item);
    byHypothesis.set(item.hypothesisId, bucket);
  }
  const hypotheses: HypothesisSynthesis[] = Array.from(byHypothesis.entries()).map(([id, bucket]) => {
    const result = synthesizeCore(bucket);
    return {
      id,
      title: bucket.find((x) => x.hypothesisTitle)?.hypothesisTitle ?? id,
      status: result.status,
      supportGroups: result.supportGroups,
      challengeGroups: result.challengeGroups,
      corroborationGroups: result.corroborationGroups,
      evidenceIds: bucket.map((x) => x.id),
      note: result.note,
    };
  });
  const domainHasOnlyHypotheses = domainItems.length === 0 && hypotheses.length > 0;
  return {
    ...core,
    hypotheses,
    missingDimensions: Array.from(new Set(missingDimensions)),
    note: domainHasOnlyHypotheses
      ? `Domain-level verdict intentionally withheld. ${hypotheses.length} separate hypothesis group(s) are shown; do not compare or merge them as if they were opposite votes on one question.`
      : core.note,
  };
}
