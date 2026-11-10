# Phalita

**Phalita (फलित)** — *that which has ripened.* The second platform of the **JYOTARA**
ecosystem: it takes a calculated horoscope and produces structured, classical,
auditable predictions.

> **GAṆAKA** calculates · **PHALITA** predicts · **ANVEṢAṆA** investigates · **ADHĪTI** learns

GAṆAKA answers *what is the chart*. PHALITA answers *what does the chart say* — career,
education, marriage, wealth, health, and the periods in which each is supported.

## What makes a prediction here different

A reading is not a sentence generated from a placement. Every verdict in this
platform is the output of a rule that exists in the repository, carries a
classical citation, and states the conditions it tests.

**Five-layer synthesis.** No domain rests on one factor. Each is scored on:

| Layer | Weight | What it reads |
|---|---|---|
| 1 — Bhāveśa | 40% | Primary house lord: dignity, placement, aspects, combustion, retrogradation |
| 2 — Naisargika kāraka | 25% | Natural significator, weighed by ṣaḍbala |
| 3 — Divisional confirmation | 15% | The domain's varga (D-9, D-10, D-24, D-2, D-6, D-30 …) |
| 4 — Aṣṭakavarga | 10% | Bindus in the bhāva, as a modifier rather than a verdict |
| 5 — Daśā | 10% | Whether the running period can deliver it, and when |

**Overrides before verdicts.** Nīchabhanga, rāja-yoga and virodha-bhanga are
applied before anything is stated, so a cancelled affliction is not reported as
an affliction.

**Every prediction is timed.** A verdict carries the daśā window in which it is
supported. A statement with no period is not a prediction.

**No AI in the path.** There is no model call, no API key, no server. The
platform is a static site and every sentence is produced by deterministic code.

## The eleven sections

Each section is a real surface in the reading workspace, not a landing page with
a form on it.

| # | Section | Basis |
|---|---|---|
| 1 | Individual Horoscope | All twelve domains, five-layer protocol |
| 2 | Career & Profession | Daśama bhāva, D-10, Amātyakāraka |
| 3 | Education & Learning | 4th / 5th / 9th bhāvas, D-24 |
| 4 | Marriage & Relationships | Saptama bhāva, Venus, D-9, Aṣṭakūṭa |
| 5 | Finance, Wealth & Property | 2nd / 11th / 4th bhāvas, D-2 |
| 6 | Health Assessment | Lagna, 6th bhāva, ariṣṭa — traditional, not medical |
| 7 | Daśā & Timing | Viṃśottarī to six levels, seven extended systems, Jaimini |
| 8 | Transit Analysis | Gocāra from the natal Moon, with vedha |
| 9 | Event Timing | Daśā stack, transitions, transit ingresses |
| 10 | Classical Rules | The rule library with text, chapter and conditions |
| 11 | Verification & Cases | The dossier: verdicts, evidence, contradictions |

The calculated chart itself — kuṇḍalī, vargas, ṣaḍbala, aṣṭakavarga, yogas,
doṣas — remains available under **Chart Data**, because a prediction you cannot
audit is a claim.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), static export |
| UI | React 19, Tailwind CSS 4, Radix UI, three.js, SVG.js |
| Language | TypeScript 5.9 |
| Runtime | Node 20+ / Bun |
| Astronomy | In-house VSOP87 / ELP2000 series (inherited from GAṆAKA) |
| Backend | None. No server, no database, no API key. |

## Quick start

```bash
npm install          # or: bun install
npm run dev          # -> http://localhost:3000
```

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build
NEXT_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/phalita npm run build   # static export
```

## Repository layout

```
app/                    routes — home, /workspace, /[section] (the eleven), about, research, documentation
components/
  home/                 landing and the birth-details console
  workspace/            the reading workspace and its panels
  sections/             section landing pages
  charts/               North / South / East Indian chart renderers
lib/
  phalita/sections.ts   the eleven sections — the spine of the site
  jyotisha/
    prediction-protocol.ts    the nine-point protocol and five-layer synthesis
    prediction-engine/        domain context, pipeline and per-domain evaluation
    indications/              canonical rule corpus, evaluators, conflict resolver
    predictions/              deep-domain and appearance engines
  astronomy/            ephemeris, ayanāṃśa, coordinates
  dashas/               Viṃśottarī and the extended systems
  shadbala/ ashtakavarga/ yogas/ doshas/ vargas/ muhurta/
scripts/                ephemeris generation and verification
```

## Accuracy and limits

The calculation engine is GAṆAKA's, and it is verified: planetary positions
within 77″ of PyEphem across 1950–2050, the Lahiri ayanāṃśa within 7″ of
Jagannatha Hora, and ṣaḍbala reproducing B. V. Raman's printed worked examples to
0.18 virūpa. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for the method behind each
number and for what the platform does *not* claim.

**Health readings are traditional Jyotiṣa assessments, not medical diagnoses.
Finance readings are classical indications, not financial advice.**

## Licence

No licence file is present. Until one is added, default copyright applies.
