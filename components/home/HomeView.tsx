'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GeometricSolarSystemBackground } from '@/components/background/GeometricSolarSystemBackground';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';
import { PHALITA_SECTIONS } from '@/lib/phalita/sections';
import { SITE_CONFIG } from '@/lib/site-config';
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
  Scale,
  Layers,
  Timer,
  FileSearch,
} from 'lucide-react';

const HomeBirthDetailsPanel = dynamic(
  () =>
    import('@/components/home/HomeBirthDetailsPanel').then(
      (mod) => mod.HomeBirthDetailsPanel
    ),
  {
    loading: () => (
      <div className="w-full min-h-[360px] p-8 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-center shadow-sm">
        <CelestialArmillaryLoading title="Phalita Reading Console" />
      </div>
    ),
  }
);

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const PILLARS = [
  {
    icon: Scale,
    title: 'Five-layer synthesis',
    body: 'No verdict rests on a single placement. House lord, kāraka, divisional chart, aṣṭakavarga and daśā are weighted 40/25/15/10/10 and reported separately.',
  },
  {
    icon: Layers,
    title: 'Divisional confirmation',
    body: 'A strong D-1 reading that collapses in the domain varga is reported as a contradiction, not smoothed into a confident sentence.',
  },
  {
    icon: Timer,
    title: 'Every prediction is timed',
    body: 'A statement without a period is not a prediction. Each verdict carries the daśā window in which it is supported.',
  },
  {
    icon: FileSearch,
    title: 'Rule-level provenance',
    body: 'Every line traces to a rule in the library with its classical text, chapter and the exact conditions it tested.',
  },
];

export function HomeView() {
  return (
    <div className="w-full flex flex-col items-center bg-[#FAF9F6]">
      {/* HERO */}
      <section
        id="hero-section"
        className="relative isolate w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden"
      >
        <GeometricSolarSystemBackground />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C2D19] ring-4 ring-[#8C2D19]/15 animate-pulse" />
              <span className="font-semibold text-stone-800 tracking-wider uppercase text-xs">
                Phalita — Predict
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-stone-500 text-xs font-sans">
              <span className="font-medium text-stone-700">JYOTARA</span>
              <span className="text-stone-300">•</span>
              <span>11 reading sections</span>
              <span className="text-stone-300">•</span>
              <span>Deterministic, no AI</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-600/20 text-[#8C2D19] rounded-full text-xs font-serif font-semibold tracking-wide">
              <span>फलित — that which has ripened</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-[1.12]">
              A calculated chart is not a prediction.
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed max-w-3xl pt-1">
              PHALITA reads the horoscope GAṆAKA calculated and produces structured predictions —
              career, education, marriage, wealth, health, and the periods in which each is
              supported. Every statement is produced by a classical rule you can open, and every
              rule carries the chapter and verse it came from.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="#calculate-chart-panel"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8C2D19] text-white text-sm font-semibold hover:bg-[#73240f] active:scale-[0.98] transition-all"
            >
              Enter birth details
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/reading"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-semibold hover:border-stone-400 active:scale-[0.98] transition-all"
            >
              What a reading contains
            </Link>
            <Link
              href="/workspace"
              className="text-xs font-mono text-stone-500 hover:text-[#8C2D19] uppercase tracking-wider ml-auto active:scale-95 transition-all select-none flex items-center gap-1"
            >
              <span>Open workspace</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        <div id="calculate-chart-panel" className="relative z-10 mt-10 max-w-5xl mx-auto">
          <HomeBirthDetailsPanel />
        </div>
      </section>

      {/* ECOSYSTEM STRIP */}
      <section className="w-full border-y border-stone-200/80 bg-stone-100/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-mono uppercase tracking-widest">
            {SITE_CONFIG.ecosystem.stages.map((stage, i) => (
              <React.Fragment key={stage.name}>
                {i > 0 && <span className="text-stone-300">→</span>}
                <span
                  className={
                    stage.current
                      ? 'text-[#8C2D19] font-bold'
                      : 'text-stone-500'
                  }
                >
                  {stage.name}
                  <span className="ml-1.5 font-sans normal-case tracking-normal text-stone-400">
                    {stage.verb}
                  </span>
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-stone-500">
            GAṆAKA calculates the horoscope. PHALITA interprets it.
          </p>
        </div>
      </section>

      {/* ELEVEN READINGS */}
      <section
        id="sections"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-20"
      >
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8C2D19] flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5" />
            <span>The reading surface</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
            Eleven sections, one chart
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
            Each section reads the calculated chart through the bhāvas, kārakas and divisional
            charts that classical Jyotiṣa assigns to it — and states what it could not confirm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {PHALITA_SECTIONS.map((section) => {
            const Icon = ICONS[section.icon] ?? Compass;
            return (
              <Link
                key={section.slug}
                href={`/${section.slug}`}
                className="group p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19] group-hover:bg-[#8C2D19]/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    {String(section.order).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 font-serif font-bold text-lg text-stone-900 leading-snug">
                  {section.title}
                </h3>
                <div className="text-xs font-serif text-[#8C2D19] mt-0.5">{section.sanskrit}</div>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed flex-1">
                  {section.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 group-hover:text-[#8C2D19] transition-colors">
                  Open section
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section
        id="methodology"
        className="w-full border-t border-stone-200/80 bg-white/60 py-14 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8C2D19]">
              Method
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
              How a Phalita prediction is built
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="p-6 bg-white border border-stone-200/90 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#8C2D19]/10 flex items-center justify-center text-[#8C2D19]">
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-serif font-bold text-base text-stone-900">{p.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HONESTY */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14">
        <div className="p-6 sm:p-8 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            What this platform does not claim
          </h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-stone-700 leading-relaxed">
            <p>
              The health reading is a traditional Jyotiṣa assessment. It is not a medical
              diagnosis, and nothing here substitutes for a physician.
            </p>
            <p>
              The finance reading describes classical indications of the dhana bhāvas. It is not
              financial advice, and no verdict here should be acted on as one.
            </p>
            <p>
              Predictions are periods in which an event is classically supported, not certainties.
              The rule library and the dossier exist so you can judge the evidence yourself.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
