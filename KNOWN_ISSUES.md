# Known issues and verification

PHALITA predicts; it does not calculate. The horoscope arrives from the GAṆAKA
engine, and the prediction layer reads it. So this file has two halves: what the
underlying calculation is verified against, and what the prediction layer itself
has and has not been checked against.

Everything below was measured by running the real code, not assumed.

---

## 1. The calculation engine (inherited from GAṆAKA)

### Ephemeris

Bodies come from truncated analytical series: VSOP87 (Bretagnon & Francou 1988)
for Mercury through Saturn, ELP2000-82B as tabulated by Meeus ch. 47 for the
Moon, and the Sun's own theory.

Measured against PyEphem, worst case over five instants spanning 1950–2050:

| Body | Worst error |
|---|---|
| Sun | 0.0″ |
| Moon | 77.3″ |
| Venus | 46.0″ |
| Mercury | 35.2″ |
| Jupiter | 26.8″ |
| Mars | 23.4″ |
| Saturn | 19.1″ |

`scripts/check-ephemeris.py` re-runs this on every build and fails above 120″.
The Lahiri ayanāṃśa for 2009-03-03 is 23.987178° against Jagannatha Hora's
23.985195° — 7.1″.

### What the ephemeris does not do

* Positions are **geometric** — no light-time, aberration or nutation. That is
  the usual convention for sidereal astrology but differs from an apparent-place
  ephemeris by up to ~20″.
* **Rāhu/Ketu** default to the mean node. The true node oscillates ±1.7° around
  it; both are offered, so this is a choice rather than an error.
* **Uranus, Neptune, Pluto** remain on Kepler orbits and are outside the
  accuracy check.

### Ṣaḍbala

Every component of BPHS ch. 27 is implemented. Ceṣṭā Bala reproduces all five of
B. V. Raman's printed values (Graha and Bhava Balas, ch. VI) to within 0.184
virūpa; the deploy re-runs that comparison and fails above 0.25.

**Fixed in this fork:** Yuddha Bala (planetary war, BPHS ch. 81 v. 9) compares
the two planets' ecliptic latitudes, but `CalculatedPlanet` did not carry a
`latitude` field — the mapping from the ephemeris dropped it, so the comparison
was made against `undefined`. The field is now carried through. This was a
silent numerical fault, not a type error: it produced a value, just not the
right one.

### Aṣṭakavarga

All seven bhinnaṣṭakavarga totals match the classical values exactly (Sun 48,
Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39). The 64 benefic
place rules were diffed against PyJHora and arbitrated by BPHS ch. 66, Sārāvalī,
Phaladīpikā ch. 23, Raman and Mehta; Ganaka's reading is retained where they
disagree, and the disagreement is recorded.

### Jaimini

For the reference chart (3 Mar 2009, 23:51 IST, Baghmara) the eight chara kārakas
and five sampled arūḍhas match Jagannatha Hora exactly. The deploy asserts both.

---

## 2. The prediction layer

### What is verified

* **Rule provenance.** Every canonical rule carries a source text, chapter and
  verse. The library is readable in the workspace, with the conditions each rule
  tests shown beside the verdict it produced.
* **Determinism.** No `Math.random` anywhere in `lib/`. The build fails if one
  reappears. The same chart produces the same reading on every load.
* **Contradiction handling.** Where a rule is satisfied and its cancellation is
  also satisfied, both are reported. The engine does not silently pick a winner.
* **Domain coverage.** All twelve life domains are evaluated dynamically from the
  chart. There is no chart-specific hardcoding anywhere in `lib/`.

### What is not verified

* **No fixture harness over the prediction output.** The rules are verified; the
  sentences they produce are not. There is no golden-file test that asserts
  "this chart yields this text".
* **Synthesis weights are a design choice, not a text.** The 40/25/15/10/10 split
  across lord, kāraka, varga, aṣṭakavarga and daśā is a defensible reading of the
  classical hierarchy, but no classical text states those percentages. They are
  labelled as the platform's protocol, not as śāstra.
* **Career rankings** use three indices (capability, interest, success) whose
  weighting is also the platform's own. Treat the ordering as indicative.
* **Health readings** are traditional assessments. They are not medical findings
  and must not be read as such.

### Fixed in this fork

* **Kuṭa Milan profile crashed on open.** `MatchingBridgePanel` read
  `chart.houses[7].lord`, but a calculated chart has `bhavas` (a 12-element
  array), not `houses`. Opening the panel threw `TypeError: Cannot read
  properties of undefined`. It now reads `chart.bhavas[6]`.
* **Type checking was not enforced.** The previous configuration skipped type
  errors on every static build with a comment claiming they were "surfaced in CI
  separately", while no `tsc` step existed. `npm run typecheck` now exists and CI
  runs it. The VSOP87 evaluator's parameter type was wrong in both the generated
  files and the generators, which alone accounted for ~5,000 of the errors.
* **The build mutated its own source.** Four `fix-*.py` scripts rewrote `lib/`
  and `components/` before compiling, then committed the result back to `main`.
  Their content is now in the source and the scripts are gone.
* **Dead code removed.** `app/api` (deleted before every build anyway), the
  unused `chart/` renderer, `@google/genai`, the Cloudflare worker, and the
  pañcāṅga / muhūrta surfaces, which belong to the calculation platform.

---

## 3. Automated guards

The deploy fails unless all of these hold:

* every body within 120″ of PyEphem, and the Lahiri ayanāṃśa within 0.02° of
  Jagannatha Hora's value;
* ṣaḍbala totals finite and in range, with the exalted Moon out-ranking the
  debilitated Jupiter;
* the eight chara kārakas and five sampled arūḍhas equal the Jagannatha Hora
  values;
* ceṣṭā bala within 0.25 virūpa of Raman's printed examples;
* `tsc --noEmit` clean;
* no `Math.random` in `lib/`;
* the static export completes and every one of the eleven section pages is
  emitted.

---

## 4. No licence

No licence file is present. Until one is added, default copyright applies.
