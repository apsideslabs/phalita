'use client';

/**
 * PHALITA — the phala reading.
 *
 * This panel does not compute anything about the chart's geometry: it takes the
 * calculated chart and applies the verses of Phaladīpikā 9 and 26 to it. Every
 * line shows the verse that produced it, in Devanagari, on demand.
 */

import React, { useMemo, useState } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { GRAHA_PROPERTIES, RASHIS } from '@/lib/jyotisha/constants';
import { buildPhalaReport, SOURCES, ALL_VERSES } from '@/lib/phalita/phala';
import type { PhalaStatement } from '@/lib/phalita/phala';
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

const TONE_LABEL: Record<string, string> = {
  shubha: 'Śubha',
  ashubha: 'Aśubha',
  mishra: 'Miśra',
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

export function PhalaPanel({ chart, ayanamshaType }: PhalaPanelProps) {
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });
  const [showCoverage, setShowCoverage] = useState(false);

  const date = useMemo(() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [dateStr]);

  const report = useMemo(
    () => buildPhalaReport(chart, date, ayanamshaType),
    [chart, date, ayanamshaType]
  );

  const source = SOURCES[0];

  return (
    <div id="phala-panel" className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
              <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
                Phala — Gochara &amp; Janma Rāśi
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                फल
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-2xl">
              Read from the janma rāśi, as the Kāmarūpa almanac tradition does — not from the lagna.
              Every line below is a verse of {source.title}, quoted in the original and applied to
              this chart.
            </p>
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

      {/* Janma rashi */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-4 h-4 text-[#8C2D19]" />
          <h3 className="text-sm font-serif font-bold text-slate-900">
            Janma Rāśi — {report.janmaRashiName} ({RASHIS[report.janmaRashi]?.name})
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Candra nakṣatra: {report.janmaNakshatra}
          </span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed">{report.rashiReading.phala}</p>
        {report.rashiReading.keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.rashiReading.keywords.map((k) => (
              <span
                key={k}
                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-serif"
              >
                {k}
              </span>
            ))}
          </div>
        )}
        <MulaBlock statement={report.rashiReading} />
      </div>

      {/* Gochara */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-slate-900">
            Gochara — transits counted from the janma rāśi
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {report.gochara.statements.length} grahas with phala ·{' '}
            {report.gochara.unstated.length} not stated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {report.gochara.statements.map((s) => {
            const g = GRAHA_PROPERTIES[s.graha!];
            const blocked = (s.modifiedBy ?? []).some((m) => m.effect === 'obstructed');
            const cancelled = (s.modifiedBy ?? []).some((m) => m.effect === 'cancelled');
            const reinforced = (s.modifiedBy ?? []).some((m) => m.effect === 'reinforced');
            return (
              <div
                key={`${s.graha}-${s.bhava}`}
                className={`bg-white rounded-2xl border p-4 shadow-xs ${
                  blocked || cancelled ? 'border-slate-300' : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-slate-900">
                        {g?.name ?? s.graha}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {g?.sanskritName}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {s.bhava}th from the Moon
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider ${
                      TONE_STYLE[s.tone]
                    }`}
                  >
                    {TONE_LABEL[s.tone]}
                  </span>
                </div>

                <p className="mt-2 text-[13px] text-slate-700 leading-relaxed">{s.phala}</p>

                {(blocked || cancelled || reinforced) && (
                  <div className="mt-2 space-y-1">
                    {(s.modifiedBy ?? []).map((m, i) => (
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
          })}
        </div>

        {report.gochara.unstated.length > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-semibold text-slate-700">Not stated in the text</h4>
            </div>
            <ul className="space-y-1">
              {report.gochara.unstated.map((u, i) => (
                <li key={i} className="text-[11px] text-slate-600 leading-snug">
                  {u.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Coverage */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCoverage((v) => !v)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C2D19]" />
            <span className="text-sm font-serif font-bold text-slate-900">
              What this corpus covers
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {ALL_VERSES.length} verses · {SOURCES.length} text
            </span>
          </span>
          {showCoverage ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {showCoverage && (
          <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
            {report.coverage.families.map((f) => (
              <div key={f.name} className="flex items-start gap-3">
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    f.status === 'complete'
                      ? 'bg-emerald-500'
                      : f.status === 'partial'
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {f.name}
                    <span className="ml-2 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{f.detail}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 mt-1 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Text: {source.title} (Mantreśvara, {source.period}). E-text from{' '}
              {source.etext.provider}, {source.etext.licence}, retrieved {source.etext.retrieved}.{' '}
              {source.etext.note}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
