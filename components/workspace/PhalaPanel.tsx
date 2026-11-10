'use client';

/**
 * PHALITA — the reading.
 *
 * The chart never appears here. Birth data goes in, and what comes out is the
 * astrologer's answer: svabhāva, vivāha, āyurdāya and the present gochara, each
 * line carrying the verse that produced it.
 *
 * Each section opens with a resolved verdict — what to follow, what was
 * outweighed, and what was cancelled — before the evidence it rests on.
 */

import React, { useMemo, useState } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { RASHIS } from '@/lib/jyotisha/constants';
import { buildReading, SOURCES, ALL_VERSES } from '@/lib/phalita/phala';
import type { PhalaStatement, ReadingSection } from '@/lib/phalita/phala';
import { buildVerdicts } from '@/lib/phalita/phala/resolve';
import type { Verdict } from '@/lib/phalita/phala/resolve';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Info,
  Moon,
  Fingerprint,
  Heart,
  Hourglass,
  Orbit,
} from 'lucide-react';

interface PhalaPanelProps {
  chart: JyotishaChart;
  ayanamshaType: AyanamshaType;
}

const TONE_STYLE: Record<string, string> = {
  shubha: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  ashubha: 'bg-rose-50 text-rose-900 border-rose-200',
  mishra: 'bg-amber-50 text-amber-900 border-amber-200',
};
const TONE_LABEL: Record<string, string> = { shubha: 'Śubha', ashubha: 'Aśubha', mishra: 'Miśra' };
const SECTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  svabhava: Fingerprint,
  vivaha: Heart,
  ayus: Hourglass,
  gochara: Orbit,
};

function MulaBlock({ statement }: { statement: PhalaStatement }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C2D19] hover:underline"
      >
        <BookOpen className="w-3 h-3" />
        {statement.citation.short}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg bg-amber-50/70 border border-amber-200/70">
          <p className="font-serif text-[13px] leading-relaxed text-amber-950 whitespace-pre-wrap">
            {statement.citation.mula}
          </p>
          <p className="mt-2 text-[10px] font-mono text-amber-800/80">
            {statement.citation.sourceTitle} · adhyāya {statement.citation.adhyaya} · śloka{' '}
            {statement.citation.shloka}
          </p>
        </div>
      )}
    </div>
  );
}

function StatementCard({ s, showGraha }: { s: PhalaStatement; showGraha?: boolean }) {
  const mods = s.modifiedBy ?? [];
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showGraha && s.graha && (
            <div className="text-[10px] font-mono text-slate-500">
              {s.bhava}th from the Moon
            </div>
          )}
          {s.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {s.keywords.slice(0, 6).map((k) => (
                <span
                  key={k}
                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-serif"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider shrink-0 ${
            TONE_STYLE[s.tone]
          }`}
        >
          {TONE_LABEL[s.tone]}
        </span>
      </div>

      <p className="mt-2 text-[13px] text-slate-700 leading-relaxed">{s.phala}</p>

      {mods.length > 0 && (
        <div className="mt-2 space-y-1">
          {mods.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-1.5 text-[11px] leading-snug rounded px-2 py-1 ${
                m.effect === 'reinforced'
                  ? 'bg-emerald-50 text-emerald-900'
                  : m.effect === 'obstructed'
                  ? 'bg-amber-50 text-amber-900'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {m.effect === 'reinforced' ? (
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              ) : m.effect === 'obstructed' ? (
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              ) : (
                <MinusCircle className="w-3 h-3 mt-0.5 shrink-0" />
              )}
              <span>{m.detail}</span>
            </div>
          ))}
        </div>
      )}

      <MulaBlock statement={s} />
    </div>
  );
}

function VerdictCard({ v }: { v: Verdict }) {
  const net =
    v.net === 'shubha'
      ? { label: 'Śubha', cls: 'bg-emerald-50 text-emerald-900 border-emerald-200' }
      : v.net === 'ashubha'
      ? { label: 'Aśubha', cls: 'bg-rose-50 text-rose-900 border-rose-200' }
      : v.net === 'balanced'
      ? { label: 'Miśra', cls: 'bg-amber-50 text-amber-900 border-amber-200' }
      : { label: '—', cls: 'bg-slate-50 text-slate-600 border-slate-200' };

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Verdict · {v.theme}
        </span>
        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${net.cls}`}>
          {net.label}
        </span>
        <span className="text-[10px] font-mono text-slate-500">confidence {v.confidence}</span>
      </div>

      {v.winner && (
        <p className="mt-2 text-[12.5px] text-slate-800 leading-relaxed">
          <span className="font-semibold">Follow: </span>
          {v.winner.phala}
          <span className="text-slate-500">
            {' '}
            ({v.winner.short}, weight {v.winner.weight})
          </span>
        </p>
      )}

      {v.cancelled.length > 0 && (
        <ul className="mt-2 space-y-1">
          {v.cancelled.map((c, i) => (
            <li
              key={i}
              className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded px-2 py-1 leading-snug"
            >
              <span className="line-through decoration-rose-400">{c.claim.short}</span> withdrawn —{' '}
              {c.by.short} cancels it.
            </li>
          ))}
        </ul>
      )}

      {v.losers.length > 0 && (
        <ul className="mt-2 space-y-1">
          {v.losers.map((l, i) => (
            <li key={i} className="text-[11px] text-slate-600 leading-snug">
              Outweighed: {l.short} (weight {l.weight}) — {l.phala}
            </li>
          ))}
        </ul>
      )}

      {v.reasoning.length > 0 && (
        <ul className="mt-2 pt-2 border-t border-slate-200 space-y-1">
          {v.reasoning.map((r, i) => (
            <li key={i} className="text-[11px] text-slate-600 leading-snug">
              · {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ section, chart }: { section: ReadingSection; chart: JyotishaChart }) {
  const verdicts = buildVerdicts(chart, section.id, section.statements);
  const Icon = SECTION_ICON[section.id] ?? BookOpen;
  const [showTested, setShowTested] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[#8C2D19]/10 text-[#8C2D19] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900">{section.title}</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl mt-0.5">
            {section.intro}
          </p>
        </div>
      </div>

      {verdicts.map((v, i) => (
        <VerdictCard key={i} v={v} />
      ))}

      {section.statements.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          {section.note ?? 'Nothing in the text applied to this chart.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {section.statements.map((s, i) => (
            <StatementCard key={i} s={s} showGraha={section.id === 'gochara'} />
          ))}
        </div>
      )}

      {section.note && section.statements.length > 0 && (
        <div className="flex items-start gap-2 px-1 text-[11px] text-slate-500 leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>{section.note}</p>
        </div>
      )}

      {section.tested.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTested((v) => !v)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
              Rules tested in this chart ({section.tested.length})
            </span>
            {showTested ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {showTested && (
            <ul className="px-4 pb-3 space-y-1 border-t border-slate-100 pt-2">
              {section.tested.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px]">
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      t.fired ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-slate-600">
                    <span className="font-mono text-slate-800">{t.rule}</span> — {t.when}
                    {!t.fired && ' — did not hold'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export function PhalaPanel({ chart, ayanamshaType }: PhalaPanelProps) {
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });

  const date = useMemo(() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [dateStr]);

  const reading = useMemo(
    () => buildReading(chart, date, ayanamshaType),
    [chart, date, ayanamshaType]
  );

  const source = SOURCES[0];

  return (
    <div id="phala-panel" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
              <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
                The Reading
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                फल
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-2xl">
              Character, marriage, longevity and the present — read from the janma rāśi, as the
              Kāmarūpa almanac tradition does. Every line is a verse of {source.title}, quoted in
              the original.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <Moon className="w-3.5 h-3.5 text-[#8C2D19]" />
              Janma rāśi {reading.janmaRashiName} ({RASHIS[reading.janmaRashi]?.name}) ·{' '}
              {reading.janmaNakshatra} · {reading.versesUsed.length} verses
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Gochara on</span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#8C2D19]"
            />
          </label>
        </div>
      </div>

      {reading.sections.map((s) => (
        <Section key={s.id} section={s} chart={chart} />
      ))}

      <div className="px-1 text-[11px] text-slate-500 leading-relaxed">
        {ALL_VERSES.length} verses held · {source.title} (Mantreśvara, {source.period}) · e-text
        from {source.etext.provider}, {source.etext.licence}. {source.etext.note} Coverage and
        pending chapters are in SOURCES.md.
      </div>
    </div>
  );
}
