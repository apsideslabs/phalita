/**
 * A verse-backed section -> HTML.
 *
 * Each statement is the phala in plain words, with its Devanagari kept behind a
 * <details> so the reading stays clean and the working is one click away.
 */

import type { PhalaStatement } from '@/lib/phalita/phala/types';

export interface SectionData {
  id: string;
  title: string;
  statements: PhalaStatement[];
  note?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderStatement(s: PhalaStatement): string {
  const mula = s.citation.mula
    ? `<details class="verse"><summary>${esc(s.citation.short)}</summary>
  <p class="mula">${esc(s.citation.mula)}</p>
  <p class="ref">${esc(s.citation.sourceTitle)} · ${s.citation.adhyaya}.${esc(s.citation.shloka)}</p>
</details>`
    : '';
  return `<div class="statement"><p>${esc(s.phala)}</p>${mula}</div>`;
}

export function renderSection(s: SectionData): string {
  const body =
    s.statements.length > 0
      ? s.statements.map(renderStatement).join('')
      : `<p class="quiet">${esc(s.note ?? 'Nothing in the text applied to this chart.')}</p>`;
  return `<section class="verses">
  <h2>${esc(s.title)}</h2>
  ${body}
</section>`;
}
