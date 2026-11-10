'use client';

/**
 * PHALITA — the twelve-domain panel, retired.
 *
 * This component used to render 23 "canonical rules" from
 * lib/jyotisha/indications/classical-sources.ts, each with a Sanskrit sloka and
 * a chapter-and-verse attribution. The attributions did not survive audit
 * against the primary text:
 *
 *   The first rule cited Phaladīpikā "Ch. 14 (Dehasaukhyādi Phala), Śloka 1–3"
 *   and quoted लग्ने लग्नपतौ वाऽपि केन्द्रत्रिकोणगे बलयुते… . Chapter 14 of
 *   Phaladīpikā is रोगनिर्णयः — the chapter on diagnosing disease — and its
 *   first verse reads रोगनिर्णय रोगस्य चिन्तामपि… . The quoted śloka is not in
 *   that chapter, and the chapter title given for it does not exist.
 *
 * One fabricated citation removes the only reason to trust the other
 * twenty-two, so the panel is retired rather than left standing with a
 * disclaimer. The sectors it covered are now read from Phaladīpikā 16, verse by
 * verse, in the Reading tab.
 *
 * The rule file itself is left in the repository as the record of what was
 * removed. Restoring any of those rules requires finding its verse in a primary
 * text first — see SOURCES.md.
 */

import React from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

interface IndicationsPanelProps {
  chart: JyotishaChart;
  focusDomainId?: string;
  initialViewMode?: string;
}

export const IndicationsPanel: React.FC<IndicationsPanelProps> = () => {
  return (
    <div id="indications-panel-retired" className="space-y-4">
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              This panel has been retired
            </h2>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-2xl">
              The twelve-domain reading that lived here was built on 23 rules whose
              Sanskrit citations did not survive checking against the primary text. The
              first cited Phaladīpikā chapter 14 for a verse that is not in it — chapter
              14 is <span className="font-serif">रोगनिर्णयः</span>, on diagnosing disease.
              Rather than show scripture it cannot vouch for, the platform withdraws the
              panel.
            </p>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed max-w-2xl">
              The sectors it claimed — career, wealth, education, health, marriage — are
              now read from Phaladīpikā 16 in the Reading tab, where every statement
              resolves to a transcribed verse you can open in Devanagari.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8C2D19] text-white text-xs font-semibold"
              >
                Open the Reading tab <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                <BookOpen className="w-3.5 h-3.5" /> See SOURCES.md for the audit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
