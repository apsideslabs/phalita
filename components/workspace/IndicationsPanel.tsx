'use client';

/**
 * PHALITA — the twelve-domain reading.
 *
 * This panel once rendered 23 rules whose Sanskrit attributions did not survive
 * audit; it was retired rather than left standing with a disclaimer. It now
 * renders the same twelve sectors from the verified rule layer: every line is a
 * condition of Phaladīpikā tested against this chart, naming the graha, its
 * sign and its house.
 *
 * Nothing here is a citation restated. If a sector has no finding, it says so.
 */

import React, { useMemo } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { readBhavas } from '@/lib/phalita/phala/rules';
import { BookOpen } from 'lucide-react';

interface IndicationsPanelProps {
  chart: JyotishaChart;
  focusDomainId?: string;
  /** Kept so the workspace still compiles; this panel has one view. */
  initialViewMode?: string;
}

interface Domain {
  id: string;
  title: string;
  bhavas: number[];
}

const DOMAINS: Domain[] = [
  { id: 'career', title: 'Career and standing', bhavas: [10, 6, 11] },
  { id: 'wealth', title: 'Wealth and income', bhavas: [2, 11] },
  { id: 'education', title: 'Education and learning', bhavas: [4, 5, 9] },
  { id: 'health', title: 'Body and health', bhavas: [1, 6] },
  { id: 'marriage', title: 'Marriage and partnership', bhavas: [7, 2] },
  { id: 'children', title: 'Children and progeny', bhavas: [5, 9] },
  { id: 'property', title: 'Home and property', bhavas: [4] },
  { id: 'fortune', title: 'Fortune and father', bhavas: [9] },
  { id: 'siblings', title: 'Siblings and courage', bhavas: [3] },
  { id: 'opposition', title: 'Debts and opposition', bhavas: [6] },
  { id: 'spirit', title: 'Dharma and renunciation', bhavas: [9, 12] },
  { id: 'travel', title: 'Travel and foreign life', bhavas: [12, 3, 9] },
];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const IndicationsPanel: React.FC<IndicationsPanelProps> = ({ chart, focusDomainId }) => {
  const shown = useMemo(
    () => (focusDomainId ? DOMAINS.filter((d) => d.id === focusDomainId) : DOMAINS),
    [focusDomainId]
  );

  const read = useMemo(
    () =>
      shown.map((d) => {
        const findings = readBhavas(chart, d.bhavas);
        const good = findings.filter((f) => f.side === 'a').sort((a, b) => b.weight - a.weight);
        const bad = findings.filter((f) => f.side === 'b').sort((a, b) => b.weight - a.weight);
        const pos = good.reduce((s, f) => s + f.weight, 0);
        const neg = bad.reduce((s, f) => s + f.weight, 0);
        const verdict = pos > neg * 1.3 ? 'Held' : neg > pos * 1.3 ? 'Strained' : 'Mixed';
        return { domain: d, good: good.slice(0, 2), bad: bad.slice(0, 2), verdict };
      }),
    [chart, shown]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[#8C2D19]/10 text-[#8C2D19] flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900">The twelve domains</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl mt-0.5">
            Each sector is read from the bhāvas that govern it, counted from the sector itself as
            well as from the lagna, with its lord and its kāraka weighed together. Every line names
            the graha, its sign and its house.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {read.map(({ domain, good, bad, verdict }) => (
          <div key={domain.id} className="bg-white rounded-2xl border border-slate-200/90 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-serif font-bold text-[13px] text-slate-900">{domain.title}</h4>
              <span
                className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider ${
                  verdict === 'Held'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : verdict === 'Strained'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {verdict}
              </span>
            </div>

            {good.length === 0 && bad.length === 0 ? (
              <p className="mt-2 text-[11.5px] text-slate-500">
                No condition of the text bears on this sector in this chart.
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {good.map((f, i) => (
                  <li key={`g${i}`} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{cap(f.text)}</span>
                  </li>
                ))}
                {bad.map((f, i) => (
                  <li key={`b${i}`} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{cap(f.text)}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-2 text-[10px] font-mono text-slate-400">
              bhāvas {domain.bhavas.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
