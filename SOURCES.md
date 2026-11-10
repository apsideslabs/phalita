# Sources and editorial policy

PHALITA states nothing that a verse does not state. This file records what the
engine is built on, how the Sanskrit was obtained, and what is still missing.

---

## 1. Why these texts

Assam has its own continuous jyotiṣa tradition, and it is not the same as the
lagna-centric presentation common on websites. What the tradition here actually
does:

* **It reads from the janma rāśi.** The Kāmarūpa almanac tradition — the
  *Kamrupiya Nibandhariya Khandasadhya* system of the Brahmaputra valley, and the
  *pañjikā* that the Daivagya / Gaṇak (Sūrya-bipra) families still compute —
  gives phala by the Moon's sign, not by the ascendant. Phaladīpikā 26.1 states
  the rule outright, and 9.13 says that what is declared for the lagna is to be
  declared for the Candra lagna as well.
* **It is a pañjikā practice.** The day's reading is the gochara of nine grahas
  counted from the janma rāśi, checked against vedha, and refined by the
  aṣṭakavarga bindus of the transited sign.
* **It is conservative about sources.** The regional manuscript collections —
  the sāncipāt and tulāpāt manuscripts catalogued by the Kāmarūpa Anusandhāna
  Samiti and the Krishna Kanta Handiqui Library, such as the *Jyotiṣa (Daśā
  Gaṇanā)* and Vaṃśivādana Dvija's *Jyotiṣa Muktāvalī* — are largely
  untranscribed, and no reliable digital text of them exists. Building on a
  garbled OCR of a regional manuscript would be worse than building on a
  well-transcribed pan-Indian text that the same tradition also uses.

So the engine is grounded in **Phaladīpikā**, which is the phala manual this
tradition actually reads, and which is Moon-centred in exactly the way the
regional practice is. Where a regional text becomes available in a trustworthy
transcription, it slots into the same corpus without any change to the engine.

## 2. What is in the corpus now

| Family | Text | Reference | Status |
|---|---|---|---|
| Janma rāśi phala | Phaladīpikā | 9.1–9.12, with the Candra-lagna rule at 9.13 | complete |
| Gochara phala | Phaladīpikā | 26.1–26.24 | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rāhu |
| Vedha (obstruction) | Phaladīpikā | 26.2–26.8 | complete |
| Aṣṭakavarga modifier | Phaladīpikā | 26.41 | complete |
| Graha-in-rāśi rules (character) | Phaladīpikā | 9.14–9.20 | wired into the Svabhāva section |
| Marriage conditions | Phaladīpikā | 10.2, 10.6, 10.7, 10.9, 10.13, 10.15 | six testable rules, with 10.7 as the cancellation |
| Longevity | Phaladīpikā | 22.24, 22.26, 22.28 | method selection and the classical caution — no date |

54 verses, 94 gochara rows, 12 rāśi readings, 6 marriage rules, 3 longevity verses. Ketu has no separate chapter in
Phaladīpikā 26 — the text treats the nodes together (26.40) and gives the phala
in 26.24 — so Ketu's transit is reported as **not stated** rather than guessed.

Two verses yield eleven effects for twelve houses in this recension (26.12 for
the Moon, 26.24 for Rāhu). The engine assigns the eleven in order and reports
the twelfth house as unstated. Both cases are flagged in the corpus and shown in
the interface.

## 2a. Longevity — why there is no death date

Phaladīpikā 22 gives three methods: aṃśāyu from the lagna's strength, piṇḍāyu
from the Sun's, and naisargika from the Moon's (22.28). The engine computes
which of the three the chart selects and reports the Vedic ceiling of a hundred
autumns (22.26).

It does not compute the number. The piṇḍāyu depends on the haraṇa reductions of
22.21 and 22.23, and 22.24 records that **Bhadanta rejected the piṇḍāyu as
primary and Varāhamihira said the same**. Where the tradition disputes its own
arithmetic, publishing a date would be a claim the text does not support. The
reading therefore stops at the method and the ceiling, and says so on the page.

## 3. What is not yet in the corpus

These are the next additions, in the order that matters most for a working
reading:

| Family | Text | Reference |
|---|---|---|
| Bhāva phala — the twelve houses | Phaladīpikā | 8 (bhāvāśraya), 15–16 (dvādaśa-bhāva-phala) |
| The rest of the marriage chapter | Phaladīpikā | 10.1, 10.3–10.5, 10.8, 10.10–10.12, 10.14 |
| Āyurdāya arithmetic | Phaladīpikā | 22.21–22.23, 22.25 (the haraṇa reductions) |
| Daśā phala — period results | Phaladīpikā | 19–20 |
| Yogas and rāja-yogas | Phaladīpikā | 6–7 |
| Aṣṭakavarga construction | Phaladīpikā | 23 |
| Nakṣatra phala — the 27 stars | Bṛhat Parāśara Horā Śāstra | 34–45 |
| Strī-jātaka and putra-bhāva | Phaladīpikā | 11–12 |

None of these are stubbed with invented content. The engine reports its own
coverage on every reading, and `npm run check:corpus` fails the build if a gap
appears that the corpus has not declared.

## 4. Editorial policy

1. **The mūla is stored verbatim.** Devanagari, exactly as in the e-text, with
   adhyāya and śloka numbers. Nothing is paraphrased into the mūla field.
2. **The English is ours.** Every rendering is the platform's own reading of the
   Sanskrit, not a quotation from Santhanam, Sastri, Sharma or any other
   published translation. Where a verse is ambiguous, the rendering stays close
   to the Sanskrit words rather than smoothing them into fluent prediction.
3. **No verse is composed.** If a rule is wanted and the verse is not held, the
   rule does not exist. There is no placeholder Sanskrit anywhere in the
   repository — the corpus check rejects a verse with no Devanagari, and no
   author here writes Devanagari from memory.
4. **Gaps are declared.** A missing house, a missing graha, a verse that lists
   eleven effects for twelve houses — each is recorded and surfaced, not filled.
5. **The reading is dated.** A gochara reading is computed for a specific date,
   which is shown, and the transit longitudes come from the GAṆAKA ephemeris
   (VSOP87 / ELP2000, verified within 77″ of PyEphem).

## 5. Text and licence

**Phaladīpikā** of Mantreśvara, c. 15th century CE.

The Devanagari was taken from the Sanskrit Wikisource transcription
(<https://sa.wikisource.org/wiki/फलदीपिका>), which is released under
**CC BY-SA 4.0**, retrieved 10 November 2026. The transcription states that it
is a typed electronic text rather than OCR of a printed page, and that full
proofreading against the printed edition is still pending; variant readings
between editions are therefore possible. Verse numbering follows that
transcription.

The Sanskrit text remains under CC BY-SA 4.0. This repository's engine, its
English renderings and its interface are its own work.

## 6. Extending the corpus

Add a file under `lib/phalita/phala/corpus-<text>-<chapter>.ts` exporting
`PhalaVerse[]` (and, where the verses carry one effect per house, `PhalaRow[]`),
register it in `lib/phalita/phala/engine.ts`, and run:

```bash
npm run check:corpus
```

The check refuses a row that points at a missing verse, a verse without
Devanagari, a duplicate (graha, bhava) pair, a missing rāśi, and any gochara gap
that is not declared in `DECLARED_GAPS`.
