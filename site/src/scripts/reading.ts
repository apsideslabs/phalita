/**
 * The only orchestration. Reads the form, builds the chart, asks the engine for
 * the narrative, and hands the pieces to the small renderers.
 */

import { calculateFullJyotishaChart } from '@/lib/jyotisha/calculator';
import { buildNarrative } from '@/lib/phalita/phala/narrative';
import { buildDashaPhala } from '@/lib/phalita/phala/dasha';
import { renderChapter } from '../render/chapter';
import { renderMasthead } from '../render/masthead';

function readForm(form: HTMLFormElement) {
  const f = new FormData(form);
  const [y, m, d] = String(f.get('date')).split('-').map(Number);
  const [hh, mm] = String(f.get('time')).split(':').map(Number);
  return {
    year: y, month: m, day: d, hour: hh, minute: mm, second: 0,
    latitude: Number(f.get('lat')),
    longitude: Number(f.get('lon')),
    timezoneOffsetHours: Number(f.get('tz')),
    locationName: '—',
    jaiminiScheme: '8_karaka' as const,
  };
}

function draw(chart: any, out: HTMLElement) {
  const now = new Date();
  const d = buildDashaPhala(chart, now);
  const chapters = buildNarrative(chart);

  out.innerHTML =
    renderMasthead({
      rashiName: chart.planets.moon.rashiName ?? '',
      nakshatra: chart.planets.moon.nakshatraName ?? '',
      dashaName: d.mahadasha.name,
      dashaStart: d.mahadasha.start,
      dashaEnd: d.mahadasha.end,
      antarName: d.antardasha?.name,
      strengthNote: d.strength.note,
    }) + chapters.map(renderChapter).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('birth-form') as HTMLFormElement | null;
  const out = document.getElementById('reading');
  if (!form || !out) return;

  const run = () => {
    try {
      out.innerHTML = '<p class="quiet">Reading…</p>';
      const chart = calculateFullJyotishaChart(readForm(form) as any);
      draw(chart, out);
    } catch (e) {
      out.innerHTML = `<p class="quiet">Could not read this chart: ${String(e)}</p>`;
    }
  };

  form.addEventListener('submit', (ev) => { ev.preventDefault(); run(); });
  run();
});
