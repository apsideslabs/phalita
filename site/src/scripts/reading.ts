/**
 * The only orchestration. Reads the form, builds the chart, asks the engine for
 * the narrative, and hands each piece to its own small renderer.
 */

import { calculateFullJyotishaChart } from '@/lib/jyotisha/calculator';
import { buildNarrative } from '@/lib/phalita/phala/narrative';
import { buildDashaPhala } from '@/lib/phalita/phala/dasha';
import { buildReading } from '@/lib/phalita/phala/reading';
import { buildCatalogue } from '@/lib/phalita/phala/catalogue-engine';
import { renderChapter } from '../render/chapter';
import { renderMasthead } from '../render/masthead';
import { renderSection } from '../render/section';
import { renderCatalogue } from '../render/catalogue';

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

function wireFilter(root: HTMLElement) {
  const input = root.querySelector('.qfilter') as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener('input', () => {
    const needle = input.value.trim().toLowerCase();
    root.querySelectorAll<HTMLDetailsElement>('details.q').forEach((el) => {
      const text = el.dataset.text ?? '';
      el.style.display = !needle || text.includes(needle) ? '' : 'none';
    });
  });
}

function draw(chart: any, out: HTMLElement) {
  const now = new Date();
  const d = buildDashaPhala(chart, now);
  const reading = buildReading(chart, now, 'lahiri');

  const masthead = renderMasthead({
    rashiName: chart.planets.moon.rashiName ?? '',
    nakshatra: chart.planets.moon.nakshatraName ?? '',
    dashaName: d.mahadasha.name,
    dashaStart: d.mahadasha.start,
    dashaEnd: d.mahadasha.end,
    antarName: d.antardasha?.name,
    strengthNote: d.strength.note,
  });

  const chapters = buildNarrative(chart).map(renderChapter).join('');
  const sections = reading.sections
    .filter((s: any) => s.id !== 'gochara')
    .map(renderSection)
    .join('');
  const catalogue = renderCatalogue(buildCatalogue(chart));

  out.innerHTML =
    masthead +
    chapters +
    `<div class="from-verses"><p class="kicker">From the verses</p>${sections}</div>` +
    catalogue;
  wireFilter(out);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('birth-form') as HTMLFormElement | null;
  const out = document.getElementById('reading');
  if (!form || !out) return;

  const run = () => {
    try {
      out.innerHTML = '<p class="quiet">Reading…</p>';
      draw(calculateFullJyotishaChart(readForm(form) as any), out);
    } catch (e) {
      out.innerHTML = `<p class="quiet">Could not read this chart: ${String(e)}</p>`;
    }
  };

  form.addEventListener('submit', (ev) => { ev.preventDefault(); run(); });
  run();
});
