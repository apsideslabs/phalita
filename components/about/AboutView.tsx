'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';
import { PHALITA_SECTIONS } from '@/lib/phalita/sections';
import { ArrowRight, Scale, Layers, Timer, FileSearch, Ban } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Scale,
    title: 'No single-point determinism',
    body: 'A reading that rests on one placement is a guess with a citation. Every domain is scored across five weighted layers and the layers are reported separately, so you can see which one carried the verdict.',
  },
  {
    icon: Layers,
    title: 'Divisional confirmation',
    body: 'The domain varga is consulted before a verdict is stated. Where D-1 and the varga disagree, the disagreement is reported — not resolved in favour of the more confident-sounding answer.',
  },
  {
    icon: Timer,
    title: 'Every prediction is timed',
    body: 'A statement with no period is not a prediction. Each verdict carries the daśā window in which it is supported, and the transits that open or close it.',
  },
  {
    icon: FileSearch,
    title: 'Provenance over fluency',
    body: 'Every line traces to a rule in the library with its classical text, chapter and the exact conditions it tested. You can open the rule and disagree with it.',
  },
  {
    icon: Ban,
    title: 'No AI in the path',
    body: 'There is no model call, no API key and no server. The platform is a static site and every sentence is produced by deterministic code that returns the same reading on every load.',
  },
];

export function AboutView() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 space-y-14">
      <header className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] font-bold">
          {SITE_CONFIG.ecosystem.label} · Platform 2 of 4
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#1A1A1A] leading-[1.1]">
          Phalita — फलित
        </h1>
        <p className="text-lg text-stone-700 leading-relaxed max-w-3xl font-serif">
          The word means <em>that which has ripened</em>. The phala is the fruit; the phalita is the
          result it has become. This platform exists for that step and nothing else: taking a
          calculated horoscope and saying what it indicates, with the evidence attached.
        </p>
      </header>

      <section id="ecosystem" className="space-y-5">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">The JYOTARA ecosystem</h2>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          Jyotiṣa work has four distinct steps, and they are usually collapsed into one product.
          JYOTARA keeps them apart, because a calculation error and an interpretation error are
          different failures and should be found in different places.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SITE_CONFIG.ecosystem.stages.map((stage, i) => (
            <div
              key={stage.name}
              className={`p-5 rounded-2xl border ${
                stage.current
                  ? 'bg-white border-[#8C2D19]/40 shadow-sm'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {stage.current && (
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-[#8C2D19] text-white px-1.5 py-0.5 rounded">
                    you are here
                  </span>
                )}
              </div>
              <div className="mt-2 font-serif font-bold text-base text-[#1A1A1A]">{stage.name}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] mt-0.5">
                {stage.verb}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          <strong className="font-semibold">GAṆAKA</strong> calculates the horoscope.{' '}
          <strong className="font-semibold">PHALITA</strong> interprets calculated horoscope data and
          produces structured predictions from verified Jyotiṣa rules. The engine is shared; the
          question is not.
        </p>
      </section>

      <section id="principles" className="space-y-5">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="p-5 bg-white border border-stone-200/90 rounded-2xl">
              <div className="w-9 h-9 rounded-lg bg-[#8C2D19]/10 text-[#8C2D19] flex items-center justify-center">
                <p.icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="mt-3 font-serif font-bold text-base text-[#1A1A1A]">{p.title}</h3>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">What it does not claim</h2>
        <ul className="space-y-2.5 text-sm text-stone-700 leading-relaxed max-w-3xl">
          <li>
            Health readings are traditional Jyotiṣa assessments of the lagna, the sixth bhāva and
            the ariṣṭa indications. They are not medical diagnoses.
          </li>
          <li>
            Finance readings describe classical indications of the dhana bhāvas. They are not
            financial advice.
          </li>
          <li>
            A prediction is a period in which an event is classically supported, not a certainty.
            The rule library and the dossier exist so the claim can be checked rather than believed.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">The readings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {PHALITA_SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group flex items-center justify-between py-1.5 border-b border-stone-200/70 text-sm"
            >
              <span className="text-stone-700 group-hover:text-[#8C2D19] transition-colors">
                {s.title}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#8C2D19] transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      <section id="contact" className="p-6 bg-stone-100/70 border border-stone-200 rounded-2xl">
        <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">Contact &amp; inquiry</h2>
        <p className="mt-2 text-sm text-stone-700 leading-relaxed">
          Corrections to a classical citation, a rule that is wrong, or a chart where the reading
          failed are all worth reporting — they are the only way the rule corpus improves. Write to{' '}
          <span className="font-mono text-[13px]">contact.thestudycipher@gmail.com</span>.
        </p>
      </section>
    </div>
  );
}
