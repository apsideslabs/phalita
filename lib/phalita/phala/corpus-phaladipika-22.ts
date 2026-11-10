/**
 * Phaladīpikā, adhyāya 22 — āyurdāya (longevity).
 *
 * This corpus holds the three verses that make a responsible longevity reading
 * possible, and deliberately holds nothing that would let the engine name a
 * date:
 *
 *   22.26 — the Vedic maximum, a hundred autumns;
 *   22.28 — which of the three āyus methods applies, from the strength of the
 *           lagna, the Sun and the Moon;
 *   22.24 — the tradition's own objection: Bhadanta rejected the piṇḍāyu as
 *           primary, and so did Varāhamihira.
 *
 * The piṇḍāyu / aṃśāyu arithmetic (22.21–22.23, 22.25) is NOT implemented. It
 * needs the haraṇa reductions of 22.21 and 22.23, and 22.24 records that the
 * authorities themselves dispute the method. Naming a death date from a
 * disputed computation is not something this platform will do.
 *
 * Text from the Sanskrit Wikisource e-text (CC BY-SA 4.0).
 */

import type { PhalaVerse } from './types';

export const PHALADIPIKA_22_VERSES: PhalaVerse[] = [
  {
    id: 'phaladipika.22.24',
    sourceId: 'phaladipika',
    adhyaya: 22,
    shloka: '24',
    subject: 'Bhadanta and Varāhamihira reject the piṇḍāyu as primary',
    mula:
      'पैण्डाख्यमायुर्ब्रुवते प्रधानं मणित्थचाणक्यमयादयश्च | एतन्न साध्वित्यवदद्भदन्तो वराहसूर्यस्य तथैव वाक्यम् ॥ २४॥',
  },
  {
    id: 'phaladipika.22.26',
    sourceId: 'phaladipika',
    adhyaya: 22,
    shloka: '26',
    subject: 'The Veda-declared maximum is a hundred autumns',
    mula:
      'नॄणां द्वादशवत्सरा दशहता ह्यायुःप्रमाणं परै- राख्यातं परमं शनेस्त्रिभगणं यावत्परैरीरितम् | कैश्चिच्चन्द्रसहस्रदर्शनमिह प्रोक्तं कलौ किन्तु यत् वेदोक्तं शरदः शतं हि परमायुर्दायमाचक्ष्महे ॥ २६॥',
  },
  {
    id: 'phaladipika.22.28',
    sourceId: 'phaladipika',
    adhyaya: 22,
    shloka: '28',
    subject: 'Aṃśāyu from the lagna, piṇḍāyu from the Sun, naisargika from the Moon',
    mula:
      'अंशोद्भवं लग्नबलात्प्रसाध्य- मायुश्च पिण्डोद्भवमर्कवीर्यात् | नैसर्गिकं चन्द्रबलात्प्रसाध्यं ब्रूमस्त्रयाणामपि वीर्यसाम्ये ॥ २८॥',
  },
];
