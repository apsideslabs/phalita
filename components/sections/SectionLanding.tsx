'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Briefcase,
  GraduationCap,
  Heart,
  Coins,
  HeartPulse,
  Clock,
  Orbit,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PhalitaSection, PHALITA_SECTIONS, PhalitaIcon } from '@/lib/phalita/sections';

const ICONS: Record<PhalitaIcon, React.ComponentType<{ className?: string }>> = {
  compass: Compass,
  briefcase: Briefcase,
  graduation: GraduationCap,
  heart: Heart,
  coins: Coins,
  'heart-pulse': HeartPulse,
  clock: Clock,
  orbit: Orbit,
  calendar: CalendarDays,
  book: BookOpen,
  shield: ShieldCheck,
};

export function SectionLanding({ section }: { section: PhalitaSection }) {
  const Icon = ICONS[section.icon];
  const index = PHALITA_SECTIONS.findIndex((s) => s.slug === section.slug);
  const prev = index > 0 ? PHALITA_SECTIONS[index - 1] : null;
  const next = index < PHALITA_SECTIONS.length - 1 ? PHALITA_SECTIONS[index + 1] : null;

  return (
    <div className="w-full flex flex-col bg-[#FAF9F6]">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 pb-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
          <Link href="/" className="hover:text-[#8C2D19] transition-colors">
            Phalita
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-700">Section {section.order} of {PHALITA_SECTIONS.length}</span>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#8C2D19]/10 text-[#8C2D19] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-stone-900 leading-[1.1]">
                  {section.title}
                </h1>
                <div className="text-sm font-serif text-[#8C2D19] mt-1">{section.sanskrit}</div>
              </div>
            </div>

            <p className="mt-5 text-base sm:text-lg text-stone-700 leading-relaxed font-serif">
              {section.tagline}
            </p>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              {section.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/workspace?section=${section.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8C2D19] text-white text-sm font-semibold hover:bg-[#73240f] active:scale-[0.98] transition-all"
              >
                Open this reading in the workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/reading"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-semibold hover:border-stone-400 active:scale-[0.98] transition-all"
              >
                Full twelve-domain reading
              </Link>
            </div>
          </div>

          <aside className="w-full lg:w-80 shrink-0 bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-3">
              What it reads
            </h2>
            <dl className="space-y-3.5 text-sm">
              <div>
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#8C2D19]">Basis</dt>
                <dd className="text-stone-700 leading-snug mt-0.5">{section.primaryBasis}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#8C2D19]">Kārakas</dt>
                <dd className="text-stone-700 leading-snug mt-0.5">{section.karakas}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#8C2D19]">Vargas</dt>
                <dd className="text-stone-700 leading-snug mt-0.5">{section.vargas}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="w-full border-y border-stone-200/80 bg-stone-100/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-5">
              How the reading is produced
            </h2>
            <ol className="space-y-4">
              {section.method.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-white border border-stone-300 text-[#8C2D19] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-5">
              Drawn from
            </h2>
            <ul className="space-y-2">
              {section.sources.map((src) => (
                <li
                  key={src}
                  className="text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 font-serif"
                >
                  {src}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-stone-500 leading-relaxed">
              Every rule carries its own chapter and verse citation, visible in the workspace beside
              the verdict it produced.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex items-stretch justify-between gap-4">
          {prev ? (
            <Link
              href={`/${prev.slug}`}
              className="group flex-1 flex items-center gap-3 p-4 bg-white border border-stone-200/90 rounded-xl hover:border-stone-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-[#8C2D19] transition-colors" />
              <span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Previous
                </span>
                <span className="block text-sm font-semibold text-stone-800">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/${next.slug}`}
              className="group flex-1 flex items-center justify-end gap-3 p-4 bg-white border border-stone-200/90 rounded-xl hover:border-stone-300 transition-colors text-right"
            >
              <span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Next
                </span>
                <span className="block text-sm font-semibold text-stone-800">{next.title}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#8C2D19] transition-colors" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </section>
    </div>
  );
}
