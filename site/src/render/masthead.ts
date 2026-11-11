/**
 * Masthead -> HTML: the janma rashi, the nakshatra, and the running dasa in one
 * sentence. Kept separate from the chapter renderer.
 */

export interface MastheadData {
  rashiName: string;
  nakshatra: string;
  dashaName: string;
  dashaStart: string;
  dashaEnd: string;
  antarName?: string;
  strengthNote: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderMasthead(m: MastheadData): string {
  const antar = m.antarName ? `, with ${esc(m.antarName)} inside it` : '';
  return `<header class="masthead">
  <p class="kicker">फल · the reading</p>
  <h1>${esc(m.rashiName)} · ${esc(m.nakshatra)}</h1>
  <p class="sub">janma rāśi, read from Phaladīpikā</p>
  <p class="dasha">${esc(m.dashaName)} runs from ${esc(m.dashaStart)} to ${esc(
    m.dashaEnd
  )}${antar}. ${esc(m.strengthNote)}</p>
</header>`;
}
