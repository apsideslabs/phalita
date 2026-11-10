'use client';

import React from 'react';

const TEXTS = [
  ['Bṛhat Parāśara Horā Śāstra', 'The primary source for bhāva phala, the ṣaḍbala chapter, daśā, and the ariṣṭa and yoga material.'],
  ['Phaladīpikā', 'Mantreśvara’s manual — gocāra and vedha, the bhāva readings, and much of the yoga material.'],
  ['Sārāvalī', 'Kalyāṇavarman — cross-checks on bhāva and yoga interpretation, particularly where BPHS is terse.'],
  ['Bṛhat Jātaka', 'Varāhamihira — the older stratum, used to arbitrate where later texts diverge.'],
  ['Jaimini Sūtras', 'Chara kārakas, arūḍha padas and the rāśi-daśā systems.'],
  ['Muhūrta Cintāmaṇi', 'The kuṭa and muhūrta rules used in the matching section.'],
];

const VERIFIED = [
  ['Ephemeris', 'Bodies within 77″ of PyEphem across 1950–2050; the Lahiri ayanāṃśa within 7.1″ of Jagannatha Hora on the reference date.'],
  ['Ṣaḍbala', 'Ceṣṭā bala reproduces all five of B. V. Raman’s printed worked examples to within 0.184 virūpa.'],
  ['Aṣṭakavarga', 'All seven bhinnaṣṭakavarga totals match the classical values exactly.'],
  ['Jaimini', 'Eight chara kārakas and five sampled arūḍhas match Jagannatha Hora on the reference chart.'],
  ['Determinism', 'No random source anywhere in the engine. The same chart yields the same reading on every load.'],
];

export function ResearchView() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 space-y-14">
      <header className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] font-bold">
          Research
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1A1A1A]">
          Sources, provenance and verification
        </h1>
        <p className="text-base text-stone-700 leading-relaxed max-w-3xl">
          A prediction platform is worth what its verification is worth. This page states what the
          readings are drawn from, how each claim is traced, and what has actually been measured.
        </p>
      </header>

      <section id="classical-texts" className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Classical texts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEXTS.map(([name, note]) => (
            <div key={name} className="p-5 bg-white border border-stone-200/90 rounded-2xl">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{name}</h3>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rule-provenance" className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Rule provenance</h2>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          Every rule in the corpus is a data structure, not a sentence buried in a conditional. Each
          carries its source text, chapter and verse, the conditions it tests, and the direct phala
          it produces when those conditions are met. The Classical Rules section of the workspace
          renders that corpus against a live chart: you can see the rule, the conditions, and
          whether each condition held.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          Where the texts disagree — and on several points they do — the disagreement is recorded in
          the rule rather than resolved silently. A reading built on a contested rule is labelled as
          contested.
        </p>
      </section>

      <section id="verification" className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">What has been verified</h2>
        <div className="space-y-3">
          {VERIFIED.map(([what, how]) => (
            <div key={what} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="sm:w-40 shrink-0 font-semibold text-sm text-[#1A1A1A]">{what}</div>
              <p className="text-sm text-stone-600 leading-relaxed">{how}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">What has not</h2>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          The rules are verified against the texts. The output they generate is not yet covered by a
          fixture harness — there is no golden-file test asserting that a given chart yields a given
          reading. The synthesis weights are the platform’s own protocol rather than a quotation, and
          they are published for that reason. Both gaps are stated in the repository’s{' '}
          <span className="font-mono text-[13px]">KNOWN_ISSUES.md</span>.
        </p>
      </section>
    </div>
  );
}
