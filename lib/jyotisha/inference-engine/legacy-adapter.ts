import type { DomainProfile, EvidenceItem } from './types';

const SECTION_DOMAIN: Record<string, string[]> = {
  svabhava: ['self_identity'],
  yogas: ['life_trajectory'],
  vivaha: ['marriage'],
  ayus: ['life_trajectory'],
  gochara: ['gochara'],
};
const asRecord = (x: unknown): Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, any> : {};

/**
 * Converts `buildReading()` output into an explicitly quarantined legacy layer.
 * The current corpus statement is useful for comparison, but its predicate
 * trace is not complete enough to promote it to validated rule evidence.
 */
export function adaptLegacyReading(legacyReading: unknown, profiles: DomainProfile[]): EvidenceItem[] {
  const root = asRecord(legacyReading);
  if (!Array.isArray(root.sections)) return [];
  const profileIds = new Set(profiles.map((p) => p.id));
  const out: EvidenceItem[] = [];
  for (const sectionRaw of root.sections) {
    const section = asRecord(sectionRaw);
    if (!Array.isArray(section.statements)) continue;
    for (const statementRaw of section.statements) {
      const statement = asRecord(statementRaw);
      const citation = asRecord(statement.citation);
      const verseId = typeof citation.verseId === 'string' ? citation.verseId : 'unknown-verse';
      const sectionId = String(section.id ?? 'unknown');
      let targets = SECTION_DOMAIN[sectionId] ?? [];
      if (sectionId === 'bhava' && Number.isInteger(statement.bhava)) {
        targets = profiles.filter((p) => p.houses.includes(statement.bhava)).map((p) => p.id);
      }
      if (!targets.length) targets = ['life_trajectory'];
      targets = Array.from(new Set(targets)).filter((id) => profileIds.has(id) || id === 'gochara');
      if (!targets.length) continue;

      const tone = statement.tone;
      const polarity = tone === 'shubha' ? 'support' : tone === 'ashubha' ? 'challenge' : 'neutral';
      const graha = typeof statement.graha === 'string' ? statement.graha : undefined;
      const bhava = Number.isInteger(statement.bhava) ? statement.bhava : undefined;
      const factKeys = [graha ? `planet:${graha}` : '', bhava ? `house:${bhava}` : ''].filter(Boolean);
      const detail = typeof statement.phala === 'string' ? statement.phala : 'Legacy corpus statement without a rendered phala.';
      for (const domainId of targets) {
        const id = `legacy:${domainId}:${verseId}:${out.length}`;
        out.push({
          id, domainId,
          title: typeof citation.short === 'string' ? citation.short : verseId,
          detail,
          polarity,
          evidenceClass: 'legacy_corpus_statement',
          reviewStatus: 'legacy_rule_not_revalidated',
          source: {
            id: typeof citation.sourceTitle === 'string' ? `legacy:${citation.sourceTitle}` : 'legacy:unknown-source',
            title: typeof citation.sourceTitle === 'string' ? citation.sourceTitle : 'Unknown source',
            chapter: citation.adhyaya,
            verse: typeof citation.shloka === 'string' ? citation.shloka : undefined,
            transcriptionStatus: 'transcription_unverified',
            translationStatus: 'translation_review_needed',
            note: 'Imported from the existing buildReading() output. The legacy predicate and condition trace was not revalidated by the new engine.',
          },
          correlationGroup: `legacy:${verseId}:${graha ?? 'no-graha'}:${bhava ?? 'no-bhava'}`,
          factKeys: factKeys.length ? factKeys : [`legacy-verse:${verseId}`],
          kind: 'legacy_statement', status: 'unverified',
          caveat: 'Retained for side-by-side audit only; excluded from the new evidence synthesis until the underlying rule and all required conditions are re-registered.',
        });

        if (Array.isArray(statement.modifiedBy)) {
          for (const modifierRaw of statement.modifiedBy) {
            const modifier = asRecord(modifierRaw);
            const effect = String(modifier.effect ?? 'unknown');
            out.push({
              id: `legacy-modifier:${id}:${String(modifier.verseId ?? effect)}`,
              domainId,
              title: typeof modifier.short === 'string' ? modifier.short : 'Legacy modifier',
              detail: typeof modifier.detail === 'string' ? modifier.detail : `Legacy modifier effect: ${effect}.`,
              polarity: 'neutral',
              evidenceClass: 'legacy_corpus_statement',
              reviewStatus: 'legacy_rule_not_revalidated',
              source: {
                id: typeof modifier.verseId === 'string' ? modifier.verseId : 'legacy:modifier',
                title: typeof modifier.short === 'string' ? modifier.short : 'Legacy modifier',
                transcriptionStatus: 'transcription_unverified',
                translationStatus: 'translation_review_needed',
              },
              correlationGroup: `legacy-modifier:${id}`,
              factKeys,
              kind: 'modifier', status: 'modifies', modifiesEvidenceId: id,
              caveat: `The existing engine labels this effect "${effect}". It is retained as metadata and is not interpreted as an independent cancellation or opposing prediction.`,
            });
          }
        }
      }
    }
  }
  return out;
}
