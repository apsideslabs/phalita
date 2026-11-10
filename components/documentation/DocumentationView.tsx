'use client';

import React from 'react';

const LAYERS = [
  ['1 — Bhāveśa', '40%', 'Primary house lord: dignity, placement, aspects received, combustion, retrogradation, nīchabhanga status'],
  ['2 — Naisargika kāraka', '25%', 'The natural significator of the domain, weighed by its ṣaḍbala rūpas and ratio'],
  ['3 — Divisional confirmation', '15%', 'The domain varga — D-9 for marriage, D-10 for career, D-24 for education, D-2 for wealth, D-6 and D-30 for health'],
  ['4 — Aṣṭakavarga', '10%', 'Sarvāṣṭakavarga bindus in the bhāva, used as a modifier and never as a verdict'],
  ['5 — Daśā', '10%', 'Whether the running mahā/antar period can deliver the result, and when'],
];

const PROTOCOL = [
  ['Ban on single-point determinism', 'No domain may be decided by one factor. Aṣṭakavarga in particular is capped at a modifier’s weight rather than allowed to carry a reading.'],
  ['Weighted synthesis', 'The five layers above, reported separately as well as combined, so the composite score can be audited.'],
  ['Nīchabhanga and rāja-yoga overrides', 'Cancellation is applied before a verdict. A debilitated planet with a valid nīchabhanga is not reported as a debilitation.'],
  ['Temporal maturity', 'A capability and the age at which it can manifest are different claims. The reading distinguishes physical (18–25), wealth (28+), career (32–36) and spiritual (42+) maturation.'],
  ['Domain-specific chart checks', 'Each of the twelve domains evaluates its own bhāva, lord, kāraka and varga. Nothing is generic.'],
  ['Career ranking by three indices', 'Capability, interest and success are scored separately and the spread is shown, rather than asserting one profession.'],
  ['Anti-hallucination clause', 'Every rule carries its canonical text and chapter. No statement is produced without one.'],
  ['Structured output', 'A fixed order: verdict, evidence, contradictions, timing, citation.'],
  ['No meta-commentary', 'The engine does not editorialise about its own confidence in prose. Confidence is a number you can read.'],
];

export function DocumentationView() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 space-y-14">
      <header className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] font-bold">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1A1A1A]">
          The prediction protocol
        </h1>
        <p className="text-base text-stone-700 leading-relaxed max-w-3xl">
          How a Phalita reading is produced, in the order the engine produces it. If a verdict in the
          workspace ever looks unjustified, this is the sequence to check it against.
        </p>
      </header>

      <section id="protocol" className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">The nine points</h2>
        <ol className="space-y-3">
          {PROTOCOL.map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-white border border-stone-300 text-[#8C2D19] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">{title}</div>
                <p className="text-sm text-stone-600 leading-relaxed mt-0.5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="weights" className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Synthesis weights</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100/80">
              <tr>
                <th className="text-left px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-stone-600">Layer</th>
                <th className="text-left px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-stone-600">Weight</th>
                <th className="text-left px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-stone-600">What it reads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {LAYERS.map(([name, weight, what]) => (
                <tr key={name} className="bg-white">
                  <td className="px-4 py-2.5 font-medium text-[#1A1A1A] whitespace-nowrap">{name}</td>
                  <td className="px-4 py-2.5 font-mono text-[#8C2D19]">{weight}</td>
                  <td className="px-4 py-2.5 text-stone-600 leading-relaxed">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
          The split is the platform’s protocol, not a quotation. No classical text states these
          percentages; what the texts do state is the hierarchy — lord first, kāraka second,
          divisional confirmation third — and these weights are one defensible reading of it. They
          are published so the reading can be argued with.
        </p>
      </section>

      <section id="timing" className="space-y-3">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Timing</h2>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          The daśā layer never denies a result; it determines when the chart can deliver it. Viṃśottarī
          is computed from the Moon’s exact arc at birth and walked to six levels. The Event Timing
          section adds the antardaśā transitions ahead and the Saturn, Jupiter and Rāhu ingresses,
          refined to the day by bisection on the computed longitude.
        </p>
      </section>

      <section id="limitations" className="space-y-3">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Known limitations</h2>
        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          The rules are verified against the texts; the sentences they produce are not yet covered by
          a fixture harness. Contested readings in the literature are labelled as contested rather
          than resolved silently. Health readings are traditional assessments, not diagnoses. The
          full list, with the method behind each measurement, is in the repository’s{' '}
          <span className="font-mono text-[13px]">KNOWN_ISSUES.md</span>.
        </p>
      </section>

      <section id="changelog" className="space-y-3">
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Changelog</h2>
        <ul className="space-y-2 text-sm text-stone-700">
          <li>
            <span className="font-mono text-[12px] text-[#8C2D19]">0.1.0</span> — Phalita forks the
            Gaṇaka engine. Eleven reading sections, the event-timing panel, the rule library and the
            verification dossier become first-class. Pañcāṅga and muhūrta surfaces removed; they
            belong to the calculation platform.
          </li>
        </ul>
      </section>
    </div>
  );
}
