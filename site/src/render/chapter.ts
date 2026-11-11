/**
 * One chapter -> HTML. Kept on its own so the renderer stays readable and the
 * file stays small.
 */

export interface Chapter {
  id: string;
  title: string;
  strap: string;
  paragraphs: string[];
  standing: 'strong' | 'mixed' | 'strained';
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderChapter(c: Chapter): string {
  const paras = c.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
  return `<section class="chapter ${c.standing}">
  <h2>${esc(c.title)}</h2>
  <p class="strap">${esc(c.strap)}</p>
  <div class="body">${paras}</div>
</section>`;
}
