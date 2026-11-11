/**
 * The 250-question catalogue -> HTML.
 *
 * Grouped by domain, each question one line, the answer behind a <details>. The
 * filter is wired in scripts/reading.ts so this file stays a pure renderer.
 */

import type { Question } from '@/lib/phalita/phala/questions';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderCatalogue(items: Question[]): string {
  const groups = new Map<string, Question[]>();
  for (const q of items) {
    const arr = groups.get(q.domain) ?? [];
    arr.push(q);
    groups.set(q.domain, arr);
  }

  const blocks = Array.from(groups.entries())
    .map(([domain, list]) => {
      const rows = list
        .map(
          (q) => `<details class="q" data-text="${esc(q.question.toLowerCase())}">
  <summary>${esc(q.question)}</summary>
  <p>${esc(q.answer)}</p>
</details>`
        )
        .join('');
      return `<div class="qgroup" data-domain="${esc(domain.toLowerCase())}">
  <p class="qdomain">${esc(domain)}</p>
  ${rows}
</div>`;
    })
    .join('');

  return `<details class="catalogue">
  <summary>All ${items.length} questions, answered from this chart</summary>
  <input class="qfilter" type="search" placeholder="Search the questions…" />
  <div class="qlist">${blocks}</div>
</details>`;
}
