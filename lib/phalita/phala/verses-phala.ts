/**
 * PHALITA — what the verses say happens.
 *
 * rules.ts used to state conditions ("Mercury occupies the 1st") and append a
 * vague phrase. This module holds the actual phala the text gives, with the
 * verse it comes from and a fragment of the Sanskrit, so every prediction is
 * checkable against the corpus.
 *
 * Only houses whose verses are in the corpus appear here. A house with no verse
 * is absent rather than filled with an invented outcome — callers must handle
 * the absence.
 */

export interface PhalaLine {
  verse: string;
  mula: string;
  phala: string;
}

export interface HousePhala {
  /** The lord well placed, dignified or strong. */
  good?: PhalaLine;
  /** The lord ill placed — duḥsthāna, debilitated, afflicted. */
  bad?: PhalaLine;
}

export const HOUSE_PHALA: Record<number, HousePhala> = {
  1: {
    good: {
      verse: 'phaladipika.16.4',
      mula: 'सुस्थे सुखी वर्धनो',
      phala: 'a lord well placed gives happiness and growth — the native prospers and the body holds',
    },
    bad: {
      verse: 'phaladipika.16.4',
      mula: 'दुःस्थे दुःख्यसदृक्षनीचभवने वासो निकृष्टस्थले',
      phala: 'a lord ill placed gives unhappiness and a dwelling in an inferior place',
    },
  },
  2: {
    good: {
      verse: 'phaladipika.16.5',
      mula: 'सत्स्वर्थे कुटुम्बश्रिया सर्वोत्कृष्टगुणो धनी च सुमुखी स्याद्दूरदर्शी',
      phala: 'wealth, the honour of the family, the highest qualities, and a name for seeing far ahead',
    },
    bad: {
      verse: 'phaladipika.16.5',
      mula: 'शनेः क्षुद्राल्पविद्यारतः',
      phala: 'with Saturn on it, meanness of mind and little learning',
    },
  },
  3: {
    good: {
      verse: 'phaladipika.16.8',
      mula: 'भ्रातृ वृद्धिः',
      phala: 'increase of brothers and of courage',
    },
    bad: {
      verse: 'phaladipika.16.8',
      mula: 'वीर्यविहीने दुःस्थने भवति सोदरनाशः',
      phala: 'loss of siblings when the lord is without strength and ill placed',
    },
  },
  4: {
    good: {
      verse: 'phaladipika.16.13',
      mula: 'वान्दोलिकां जनपतेश्वरतां … स्वर्णद्यनर्ध्यमणिभूषणपट्टशय्या',
      phala: 'a palanquin, command over people, gold and priceless jewels, silks, and beds to lie on — comfort and conveyances',
    },
    bad: {
      verse: 'phaladipika.16.14',
      mula: 'जन्मगृहं प्रदग्धम् … परैर्हृतं गोक्षितिवाहनाद्यम्',
      phala: 'the birth-house burnt by Mars or the Sun, or taken from you by others',
    },
  },
  5: {
    good: {
      verse: 'phaladipika.16.15',
      mula: 'धीमान्निष्कपटी भवेत्',
      phala: 'wisdom, and a nature without guile',
    },
  },
  6: {
    good: {
      verse: 'phaladipika.16.18',
      mula: 'शत्रुनाशं',
      phala: 'destruction of enemies — rivals fall away rather than press on you',
    },
  },
  7: {
    good: {
      verse: 'phaladipika.16.20',
      mula: 'पतिपुत्रवती … भार्या सर्क्गुणैर्वृता',
      phala: 'a spouse of good qualities, with husband and children about her',
    },
  },
  8: {
    good: {
      verse: 'phaladipika.16.21',
      mula: 'नाधिर्न विघ्नो न क्लेशो … आयुश्चिरं भवेत्',
      phala: 'no illness, no obstruction and no suffering, and a long life',
    },
  },
  10: {
    good: {
      verse: 'phaladipika.16.27',
      mula: 'महितपृथुयशाः … नृपतिसदृशभाग्यं दीर्घमायुश्च',
      phala: 'wide and honoured fame, a fortune like a king\u2019s, and a long life',
    },
  },
  11: {
    good: {
      verse: 'phaladipika.16.29',
      mula: 'भावं तदनुरूपस्य वस्तुनो लाभगैरपि',
      phala: 'gain of the very things that bhāva governs',
    },
  },
};

/** 16.19: a bhāveśa placed in the sixth makes its own bhāva hostile. */
export const LORD_IN_SIXTH: PhalaLine = {
  verse: 'phaladipika.16.19',
  mula: 'षष्टस्थितो यद्भावेशस्ते भावाः शत्रुतां ययुः',
  phala: 'that bhāva turns hostile — what it governs comes to oppose you rather than support you',
};

/** 9.20: a retrograde graha gives the phala of its exaltation. */
export const RETROGRADE: PhalaLine = {
  verse: 'phaladipika.9.20',
  mula: 'वक्रं गतः स्वोच्चफलं विदध्यात्',
  phala: 'a retrograde graha gives the phala of its exaltation, even in an inimical sign',
};

export function phalaFor(house: number, side: 'a' | 'b'): PhalaLine | undefined {
  const entry = HOUSE_PHALA[house];
  return side === 'a' ? entry?.good : entry?.bad;
}
