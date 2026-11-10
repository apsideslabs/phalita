/**
 * Phaladīpikā, adhyāya 7 — राजयोगः (rājayoga), the nīchabhanga verses.
 *
 * 7.26–7.30 give the cancellation of debilitation (nīchabhanga): a graha fallen
 * into its debilitation is restored when the lord of that very sign, or the lord
 * of the sign of its exaltation, stands in a kendra from the lagna or from the
 * Moon. This is the rule the engine was missing: without it a debilitated planet
 * was weighed down and left there.
 *
 * Text from the Sanskrit Wikisource e-text (CC BY-SA 4.0).
 */

import type { PhalaVerse } from './types';

export const PHALADIPIKA_07_VERSES: PhalaVerse[] = [
  {
    id: 'phaladipika.7.26',
    sourceId: 'phaladipika',
    adhyaya: 7,
    shloka: '26',
    subject: 'Nīchabhanga — the lord of the debilitation sign or of the exaltation sign in a kendra',
    mula:
      'नीचभंग राजयोग नीचस्थितो जन्मनि योग्रहः स्यात्त्द्राशिनाथोऽपि तदुच्चनाथः | स चन्द्रलग्नाद्यदि केन्द्रवर्ती राजा भवेद्धार्मिकचक्रवर्ती || २६||',
  },
  {
    id: 'phaladipika.7.27',
    sourceId: 'phaladipika',
    adhyaya: 7,
    shloka: '27',
    subject: 'The same rule stated for a single graha',
    mula:
      'यद्येको नीचगतत्तद्राश्यधिपस्तदूच्चपः केन्द्रे | यस्य स तु चक्रवर्ती समस्तभूपालवन्द्यांध्रिः || २७||',
  },
  {
    id: 'phaladipika.7.30',
    sourceId: 'phaladipika',
    adhyaya: 7,
    shloka: '30',
    subject: 'Both lords, or either, in a kendra',
    mula:
      'नीचे यस्तस्य नीचोच्चभेशौ द्वावेक एव वा केन्द्रस्थश्चेच्चक्रवर्ती भूपः स्याद्भुपवन्दितः || ३०||',
  },
];
