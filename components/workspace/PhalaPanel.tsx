'use client';

/**
 * PHALITA — the reading.
 *
 * A reading is prose, not a table of answers. This panel opens with the
 * narrative: ten chapters, one per sector of life, written as an astrologer
 * would speak them. The verse-backed sections and the full question catalogue
 * sit underneath, for anyone who wants the working.
 */

import React, { useMemo, useState } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { RASHIS } from '@/lib/jyotisha/constants';
import { buildReading, SOURCES, ALL_VERSES } from '@/lib/phalita/phala';
import type { PhalaStatement, ReadingSection } from '@/lib/phalita/phala';
import { buildVerdicts } from '@/lib/phalita/phala/resolve';
import type { Verdict } from '@/lib/phalita/phala/resolve';
import { buildDashaPhala } from '@/lib/phalita/phala/dasha';
import { buildNarrative } from '@/lib/phalita/phala/narrative';
import { buildCatalogue } from '@/lib/phalita/phala/catalogue-engine';
import { BookOpen, Calendar, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface PhalaPanelProps {
  chart: JyotishaChart;
  ayanamshaType: AyanamshaType;
}

function Mula({ s }: { s: PhalaStatement }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-[#8C2D19]"
      >
        <BookOpen className="w-3 h-3" />
        {s.citation.short}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded bg-stone-50 border border-stone-200">
          <p className="font-serif text-[13px] leading-relaxed text-stone-800 whitespace-pre-wrap">
            {s.citation.mula}
          </p>
          <p className="mt-2 text-[10px] font-mono text-stone-400">
            {s.citation.sourceTitle} · {s.citation.adhyaya}.{s.citation.shloka}
          </p>
        </div>
      )}
    </div>
  );
}

/** A verse-backed statement, rendered quietly. */
function Statement({ s }: { s: PhalaStatement }) {
  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <p className="font-serif text-[14.5px] leading-[1.75] text-stone-800">{s.phala}</p>
      <Mula s={s} />
    </div>
  );
}

function VerdictLine({ v }: { v: Verdict }) {
  if (v.net === 'withheld') {
    return (
      <p className="my-3 pl-3 border-l-2 border-stone-300 text-[13px] leading-relaxed text-stone-500 italic">
        {v.reasoning[0]}
      </p>
    );
  }
  return null;
}

export function PhalaPanel({ chart, ayanamshaType }: PhalaPanelProps) {
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const date = useMemo(() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [dateStr]);

  const reading = useMemo(() => buildReading(chart, date, ayanamshaType), [chart, date, ayanamshaType]);
  const chapters = useMemo(() => buildNarrative(chart), [chart]);
  const dasha = useMemo(() => buildDashaPhala(chart, date), [chart, date]);
  const source = SOURCES[0];

  return (
    <div id="phala-panel" className="max-w-3xl mx-auto">
      <header className="pb-6 border-b border-stone-200">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C2D19]">
              फल · the reading
            </p>
            <h1 className="mt-1 font-serif text-2xl text-stone-900 tracking-tight">
              {reading.janmaRashiName} · {reading.janmaNakshatra}
            </h1>
            <p className="mt-1 text-[12px] text-stone-500">
              janma rāśi {RASHIS[reading.janmaRashi]?.name} · read from Phaladīpikā
            </p>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-stone-500">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="px-2 py-1 rounded border border-stone-200 bg-white font-mono text-[11px] focus:outline-none focus:border-[#8C2D19]"
            />
          </label>
        </div>

        <p className="mt-4 font-serif text-[15px] leading-[1.8] text-stone-700">
          {dasha.mahadasha.name} runs from {dasha.mahadasha.start} to {dasha.mahadasha.end}
          {dasha.antardasha ? `, with ${dasha.antardasha.name} inside it` : ''}. {dasha.strength.note}
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {chapters.map((c) => (
          <section key={c.id}>
            <h2 className="font-serif text-[19px] text-stone-900">{c.title}</h2>
            <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-stone-400">
              {c.strap}
            </p>
            <div className={`mt-3 pl-4 border-l ${c.standing === 'strong' ? 'border-emerald-200' : c.standing === 'strained' ? 'border-rose-200' : 'border-stone-200'}`}>
              {c.paragraphs.map((p, i) => (
                <p key={i} className="font-serif text-[15px] leading-[1.85] text-stone-800 mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 pt-8 border-t border-stone-200 space-y-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">
          From the verses
        </p>
        {reading.sections
          .filter((s) => s.id !== 'gochara')
          .map((section: ReadingSection) => {
            const verdicts = buildVerdicts(chart, section.id, section.statements);
            return (
              <section key={section.id}>
                <h2 className="font-serif text-[17px] text-stone-900">{section.title}</h2>
                {verdicts.map((v, i) => (
                  <VerdictLine key={i} v={v} />
                ))}
                <div className="mt-2">
                  {section.statements.length === 0 ? (
                    <p className="text-[13px] text-stone-500 italic">{section.note ?? 'Nothing in the text applied to this chart.'}</p>
                  ) : (
                    section.statements.map((s, i) => <Statement key={i} s={s} />)
                  )}
                </div>
              </section>
            );
          })}

        <section>
          <h2 className="font-serif text-[17px] text-stone-900">The present</h2>
          <p className="mt-1 text-[12px] text-stone-500">
            Transits counted from the janma rāśi on {date.toLocaleDateString('en-GB')}.
          </p>
          <div className="mt-2">
            {reading.sections
              .filter((s) => s.id === 'gochara')
              .flatMap((s) => s.statements)
              .map((s, i) => (
                <Statement key={i} s={s} />
              ))}
          </div>
        </section>
      </div>

      <details className="mt-14 pt-8 border-t border-stone-200">
        <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-[0.15em] text-stone-500 hover:text-[#8C2D19]">
          All 250 questions, answered from this chart
        </summary>
        <CatalogueBody chart={chart} />
      </details>

      <footer className="mt-10 pt-6 border-t border-stone-200 text-[11px] leading-relaxed text-stone-400">
        {ALL_VERSES.length} verses held · {source.title}, Mantreśvara, {source.period}. E-text from{' '}
        {source.etext.provider}, {source.etext.licence}. A grave reading is never pronounced from a
        single condition — Phaladīpikā 15.6 requires two to agree.
      </footer>
    </div>
  );
}

/** The 250-question catalogue, grouped and searchable, kept out of the reading. */
function CatalogueBody({ chart }: { chart: JyotishaChart }) {
  const all = useMemo(() => buildCatalogue(chart), [chart]);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((c) => c.question.toLowerCase().includes(needle)) : all;
  }, [all, q]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof shown>();
    for (const c of shown) {
      const arr = m.get(c.domain) ?? [];
      arr.push(c);
      m.set(c.domain, arr);
    }
    return Array.from(m.entries());
  }, [shown]);

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded bg-white">
        <Search className="w-3.5 h-3.5 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 250 questions…"
          className="flex-1 text-[12px] bg-transparent focus:outline-none placeholder:text-stone-400"
        />
      </label>

      <div className="mt-4 space-y-6">
        {grouped.map(([domain, list]) => (
          <div key={domain}>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-stone-400">
              {domain}
            </p>
            <div className="mt-1">
              {list.map((c) => (
                <div key={c.id} className="border-b border-stone-100 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === c.id ? null : c.id)}
                    className="w-full text-left py-2 text-[13px] text-stone-700 hover:text-stone-900"
                  >
                    {c.question}
                  </button>
                  {openId === c.id && (
                    <p className="pb-3 font-serif text-[13.5px] leading-[1.75] text-stone-700">
                      {c.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
