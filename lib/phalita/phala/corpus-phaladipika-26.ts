/**
 * Phaladīpikā, adhyāya 26 — गोचरफलम् (gochara phala).
 *
 * Mantreśvara's transit chapter is the table a working astrologer in the
 * Brahmaputra valley actually reads from: the pañjikā tradition of Assam reads
 * phala from the janma rāśi (the Moon's sign), not from the lagna, and 26.1
 * states exactly that rule. Every verse below is stored verbatim from the
 * Sanskrit Wikisource e-text (CC BY-SA 4.0); the English is this platform's own
 * reading of the Sanskrit, not a quotation from any published translation.
 *
 * Where a verse does not state one effect per house, `mappingNote` says so and
 * the engine reports only what is actually written.
 */

import type { PhalaRow, PhalaVerse } from './types';

export const PHALADIPIKA_26_VERSES: PhalaVerse[] = [
  {
    id: 'phaladipika.26.1',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '1',
    subject: 'Gochara is to be judged from the Chandra lagna',
    mula:
      'गोचरफल सर्वेषु लग्नेष्वपि सत्सु चन्द्र-लग्नं प्रधानं खलु गोचरेषु । तस्मात्तदृक्षादपि वर्तमान्-ग्रहेन्द्रचारैः कथयेत्फलानि ॥ १॥',
  },
  {
    id: 'phaladipika.26.2',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '2',
    subject: 'The auspicious houses of transit for each graha',
    mula:
      'सूर्यः षट्त्रिदशस्थितस्त्रिदशषट्सप्ताद्यगश्चन्द्रमाः जीवस्त्वस्ततपोद्विपंचमगतो वक्रार्कजौ षट्त्रिगौ । सौम्यः षट्स्वचतुर्दशाष्टमगतः सर्वेऽप्युपान्तस्थिताः शुक्रः खास्तरिपून्विहाय शुभदस्तिग्मांशुवद्भोगिनौ ॥ २॥',
  },
  {
    id: 'phaladipika.26.3',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '3',
    subject: 'Surya: auspicious houses and their vedha places',
    mula:
      'लाभविक्रमखशत्रषु स्थितः शोभनो निगदितो दिवाकरः । खेचरैः सुततपोजलान्त्यगैः व्यार्किभिर्यदि न विद्ध्यते तदा ॥ ३॥',
  },
  {
    id: 'phaladipika.26.4',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '4',
    subject: 'Chandra: auspicious houses and their vedha places',
    mula:
      'द्यूनजन्मरिपुलाभखत्रिगः चन्द्रमाः शुभफलप्रदः सदा । स्वात्मजान्त्यमृतिबन्धुधर्मगै विध्द्यते न विबुधैर्यदि ग्रहैह् ॥ ४॥',
  },
  {
    id: 'phaladipika.26.5',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '5',
    subject: 'Mangala: auspicious houses and their vedha places',
    mula:
      'विक्रमायरिपुगः कुजः शुभः स्यात्तदान्त्यसुतधर्मगैः खगैः । चेन्न विद्ध इनसूनुरप्यसौ किन्तु धर्मधृणना न विध्द्यते ॥ ५॥',
  },
  {
    id: 'phaladipika.26.6',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '6',
    subject: 'Budha: auspicious houses and their vedha places',
    mula:
      'स्वाम्बुशत्रुमृतिखायगः शुभो ज्ञस्तदा न खलु विध्द्यते सदा । स्वाल्मजत्रितप आद्यनैधन प्राप्तिगैविबुधुभिर्यदि ग्रहैः ॥ ६॥',
  },
  {
    id: 'phaladipika.26.7',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '7',
    subject: 'Guru: auspicious houses and their vedha places',
    mula:
      'स्वायधर्मतनयास्तसंस्थितो नाकनायकपुरोहितः शुभः । रिःफरन्ध्रखजलत्रिगैर्यदा विध्द्यते गगनचारिभिर्न हि ॥ ७॥',
  },
  {
    id: 'phaladipika.26.8',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '8',
    subject: 'Shukra: auspicious houses and their vedha places',
    mula:
      'आसुताष्टमतपोव्ययायगो विद्ध आस्फुजिदशोभनः स्मृतः । नैधनास्ततनुकर्मधर्मधीलाभवरिसहजस्थखेचरैः ॥ ८॥',
  },
  {
    id: 'phaladipika.26.9',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '9',
    subject: 'Surya in the 1st to the 4th house from the janma rashi',
    mula:
      'जन्मन्यायासदाता क्षपयति विभवान् क्रोधरोगाध्वदाता वित्तभ्रंशं द्वितीये दिशति न सुखदो पञ्चनामाग्रहं च । स्थानप्राप्तिं तृतीये धननिचयमुदाकल्यकृच्चारिहन्ता रोगाण् दत्ते चतुर्थे जनयति च मुहुः स्रग्धराभोगविघ्नम् ॥ ९॥',
  },
  {
    id: 'phaladipika.26.10',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '10',
    subject: 'Surya in the 5th to the 8th house',
    mula:
      'वित्तक्षोभं सुतस्थो वितरति बहुशो रोगमोहादिदाता षष्ठेऽर्को हन्ति रोगान् क्षपयति च रिपूञ्छोकमोहान्प्रमाष्टिं । आध्वानं सप्तमस्थो जठरगुदभयं दैन्यभावं च तस्मै रुक्त्रासावष्टमस्थः कलयति कलहं राजभीतिं च तापम् ॥ १०॥',
  },
  {
    id: 'phaladipika.26.11',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '11',
    subject: 'Surya in the 9th to the 12th house',
    mula:
      'आपद्दैन्यं तपसि विरहं चित्तचेष्टानिरोधं प्राप्तोन्युग्रां दशमगृहगे कर्मसिद्धिं दिनेशे । स्थानं मानं विभवमपि चैकादशे रोगनाशं क्लेशं वित्तक्षयमपि सुहृद्वैरमन्त्ये ज्वरं च ॥ ११॥',
  },
  {
    id: 'phaladipika.26.12',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '12',
    subject: 'Chandra in the twelve houses',
    mula:
      'क्रमेण भाग्योदयमर्थहातिं जयं श्लोकमरोगतां च । सुखान्यनिष्टं गदमिष्टसिद्धिं मोदं व्ययं च प्रददाति चन्द्रः ॥ १२॥',
    mappingNote:
      'The verse lists eleven effects for twelve houses. This build assigns the eleven in order to houses 1–11 and reports the 12th as not stated, rather than inventing a twelfth.',
  },
  {
    id: 'phaladipika.26.13',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '13',
    subject: 'Mangala in the 1st to the 4th house',
    mula:
      'अन्तः शोकं स्वजनविरहं रक्तपित्तोष्णरोगं लग्ने वित्ते भयमपि गिरां दोषमर्थक्षयं च । धैरे भौमो जनयति जयं स्वर्णभूषंप्रमोदं स्थानभ्रंशं रुजमुदरजां बन्धुदुःखं चतुर्थे ॥ १३॥',
  },
  {
    id: 'phaladipika.26.14',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '14',
    subject: 'Mangala in the 5th and the 6th house',
    mula:
      'ज्वरमनुचितचिन्तां पुत्रहेतुव्यथां वा कलयति कलहंस्वैः पञ्चमे भूमिपुत्रः । रिपुकलहनिवृत्तिं रोगशान्तिं च षष्ठे विजयमथ धनाप्तिं सर्वकार्यानुकूल्यम् ॥ १४॥',
  },
  {
    id: 'phaladipika.26.15',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '15',
    subject: 'Mangala in the 7th to the 9th house',
    mula:
      'कलत्रकलहाक्षिरुग्जठररोगकृत्सप्तमे ज्वरक्षतजरूक्षितो विगतवित्तमानोऽष्टमे । कुजे नवमसंस्थिते परिभवोऽर्थनाशादिभि-विलम्बितगतिर्भवत्यबलदेहधातुक्षयैः ॥ १५॥',
  },
  {
    id: 'phaladipika.26.16',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '16',
    subject: 'Mangala in the 10th to the 12th house',
    mula:
      'दुश्चेष्टा वा कर्मविघ्नः श्रमः खे द्रव्यारोग्यक्षेत्रवृद्धिश्च लाभे । भौमः खेटो गोचरे द्वादशस्थो द्रव्यच्छेदस्ताप उष्णामयाद्यैः ॥ १६॥',
  },
  {
    id: 'phaladipika.26.17',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '17',
    subject: 'Budha in the twelve houses',
    mula:
      'वित्तक्षयं श्रियमरातिभयं धनाप्तिं भार्याप्तनूजकलहं यिजयं विरोधम् । पुत्रार्थलाभमथ विघ्नमशेषसौख्यं पुष्टिं पराभवभयं प्रकरोति चान्द्रिः ॥ १७॥',
  },
  {
    id: 'phaladipika.26.18',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '18',
    subject: 'Guru in the 1st to the 4th house',
    mula:
      'जीवे जन्मनि देशनिर्गमनमप्यर्थच्युतिं शत्रुतां प्राप्नोति द्रविणं कुटुम्बसुखमप्यर्थे स्ववाचां फलम् । दुश्चिक्ये स्थितिनाशमिष्टवियुतिं कार्यान्तरायं रुजं दुःखैर्बन्धुजनोद्भवैश्च हिबुके दैन्यं चतुष्पाद्भयम् ॥ १८॥',
  },
  {
    id: 'phaladipika.26.19',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '19',
    subject: 'Guru in the 5th to the 8th house',
    mula:
      'पुत्रोत्पत्तिमुपैति सज्जनयुतिं राजामुकूल्यं सुते षष्ठे मन्त्रिणि पीडयन्ति रिपवः स्वज्ञातयो व्याधयः । यात्रां शोभनहेतवे वनितया सौख्यं सुताप्तिं स्मरे मार्गक्लेशमरिष्टमष्टमगते नष्टं धनैः कष्टताम् ॥ १९॥',
  },
  {
    id: 'phaladipika.26.20',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '20',
    subject: 'Guru in the 9th to the 12th house',
    mula:
      'भाग्ये जीवे सर्वसौभाग्यसिद्धिः कर्मण्यर्थास्थनपुत्रादिपिडा लाभे पुत्रस्थानमानदिलाभो रिःफे दुःखं साध्वसं द्रव्यहेतोः ॥ २०॥',
  },
  {
    id: 'phaladipika.26.21',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '21',
    subject: 'Shukra in the twelve houses',
    mula:
      'अखिलविषयभोगं वित्तसिद्धिं विभूतिं सुखसुहृदभिवृद्धिं पुत्रलब्धिं विपत्तिम् । दिशति युवतिपीडां सम्पदं वा सुखाप्तिं कलहमभयमर्थप्राप्तिमिन्द्रारिमन्त्री ॥ २१॥',
  },
  {
    id: 'phaladipika.26.22',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '22',
    subject: 'Shani in the 1st to the 8th house',
    mula:
      'रोगाशौचक्रियाप्तिं धनसुतविहतिं स्थानभृत्यार्थलाभं स्त्रीबन्ध्वर्थप्रणाशं द्रविणसुतमतिप्रच्युतिं सर्वसौख्यम् । स्त्रीरोगाध्वावभीतिं स्वसुतपशुसुहृद्बित्तनाशामयातिं जन्मादेरष्टमान्तं दिशति पदवशेनार्कसूनुः क्रमेण ॥ २२॥',
    mappingNote:
      'The verse gives eight effects for the eight houses from the janma rāśi to the eighth, one per house, in order.',
  },
  {
    id: 'phaladipika.26.23',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '23',
    subject: 'Shani in the 9th to the 12th house',
    mula:
      'दारिध्रं धर्मविघ्नं पितृसमविलयं नित्यदुःखं शुभस्थे दुर्व्यापारप्रवृत्तिं कलयति दशमे मानभङ्गं रुजं वा । सौख्यान्येकादशस्थो बहुविधविभवप्राप्तिमुत्कृष्टकीर्तिं विश्रान्ति व्यर्थकार्याद्विसुहृतिमरिभिः स्त्रीसुतव्याधिमन्त्ये ॥ २३॥',
  },
  {
    id: 'phaladipika.26.24',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '24',
    subject: 'Rahu in the twelve houses',
    mula:
      'देहक्षयं वित्तविनाशसौख्ये दुःखार्थनाशौ सुखनाशमृत्यून् । हानिं च लाभं सुभगं व्ययं च कुर्यत्तमो जन्मगृहात्क्रमेण ॥ २४॥',
    mappingNote:
      'The verse yields eleven effects for twelve houses in this recension. The eleventh is assigned to the eleventh house and the twelfth is reported as not stated.',
  },
  {
    id: 'phaladipika.26.41',
    sourceId: 'phaladipika',
    adhyaya: 26,
    shloka: '41',
    subject: 'A transiting graha gives the phala of the house where it has more bindus',
    mula:
      'यत्राष्टवर्गेऽधिकबिन्दवः स्यु-स्तत्र स्थितो गोचरतो ग्रहेन्द्रः । तद्वत्फलं प्राह शुभं व्ययारि-रन्ध्रस्थितो वाऽपि शुभं विद्धत्ते ॥ ४१॥',
  },
];

/**
 * The parsed effects. One row per (graha, bhava). The English is this
 * platform's reading of the Sanskrit in the verse named by `verseId`.
 */
export const PHALADIPIKA_26_ROWS: PhalaRow[] = [
  // ---- Surya (26.9, 26.10, 26.11) ----
  { verseId: 'phaladipika.26.9', graha: 'sun', bhava: 1, tone: 'ashubha', keywords: ['आयास', 'विभवक्षय', 'क्रोध', 'रोग', 'अध्व'], phala: 'Effort and hardship; wealth is consumed; anger, disease and travel.' },
  { verseId: 'phaladipika.26.9', graha: 'sun', bhava: 2, tone: 'ashubha', keywords: ['वित्तभ्रंश'], phala: 'Loss of wealth; the verse says plainly that it gives no happiness.' },
  { verseId: 'phaladipika.26.9', graha: 'sun', bhava: 3, tone: 'shubha', keywords: ['स्थानप्राप्ति', 'धननिचय', 'अरिहन्ता'], phala: 'Attainment of position, accumulation of wealth, destruction of enemies.' },
  { verseId: 'phaladipika.26.9', graha: 'sun', bhava: 4, tone: 'ashubha', keywords: ['रोग', 'भोगविघ्न'], phala: 'Disease, and repeated obstruction to enjoyment.' },
  { verseId: 'phaladipika.26.10', graha: 'sun', bhava: 5, tone: 'ashubha', keywords: ['वित्तक्षोभ', 'रोग', 'मोह'], phala: 'Agitation over wealth, with disease and delusion.' },
  { verseId: 'phaladipika.26.10', graha: 'sun', bhava: 6, tone: 'shubha', keywords: ['रोगहन्ता', 'रिपुक्षय', 'शोकमोहनाश'], phala: 'Destroys disease, destroys enemies, removes sorrow and delusion.' },
  { verseId: 'phaladipika.26.10', graha: 'sun', bhava: 7, tone: 'ashubha', keywords: ['अध्व', 'जठरगुदभय', 'दैन्य'], phala: 'Journeys, fear of abdominal and bowel disease, and poverty.' },
  { verseId: 'phaladipika.26.10', graha: 'sun', bhava: 8, tone: 'ashubha', keywords: ['कलह', 'राजभीति', 'ताप'], phala: 'Quarrels, fear of the king, and burning affliction.' },
  { verseId: 'phaladipika.26.11', graha: 'sun', bhava: 9, tone: 'ashubha', keywords: ['आपद्', 'दैन्य', 'विरह', 'चित्तनिरोध'], phala: 'Misfortune, poverty, separation, and obstruction of the mind\'s activity.' },
  { verseId: 'phaladipika.26.11', graha: 'sun', bhava: 10, tone: 'shubha', keywords: ['उग्रप्रयत्न', 'कर्मसिद्धि'], phala: 'Fierce exertion, and success in what is undertaken.' },
  { verseId: 'phaladipika.26.11', graha: 'sun', bhava: 11, tone: 'shubha', keywords: ['स्थान', 'मान', 'विभव', 'रोगनाश'], phala: 'Position, honour, wealth, and the destruction of disease.' },
  { verseId: 'phaladipika.26.11', graha: 'sun', bhava: 12, tone: 'ashubha', keywords: ['क्लेश', 'वित्तक्षय', 'सुहृद्वैर', 'ज्वर'], phala: 'Trouble, loss of wealth, enmity with friends, and fever.' },

  // ---- Chandra (26.12) ----
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 1, tone: 'shubha', keywords: ['भाग्योदय'], phala: 'Rise of fortune.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 2, tone: 'ashubha', keywords: ['अर्थहाति'], phala: 'Loss of wealth.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 3, tone: 'shubha', keywords: ['जय'], phala: 'Victory.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 4, tone: 'shubha', keywords: ['श्लोक'], phala: 'Fame and good report.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 5, tone: 'shubha', keywords: ['अरोगता'], phala: 'Freedom from disease.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 6, tone: 'shubha', keywords: ['सुख'], phala: 'Comforts.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 7, tone: 'ashubha', keywords: ['अनिष्ट'], phala: 'What is undesired.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 8, tone: 'ashubha', keywords: ['गद'], phala: 'Disease.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 9, tone: 'shubha', keywords: ['इष्टसिद्धि'], phala: 'Fulfilment of what is wished for.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 10, tone: 'shubha', keywords: ['मोद'], phala: 'Joy.' },
  { verseId: 'phaladipika.26.12', graha: 'moon', bhava: 11, tone: 'mishra', keywords: ['व्यय'], phala: 'Expenditure.' },

  // ---- Mangala (26.13–26.16) ----
  { verseId: 'phaladipika.26.13', graha: 'mars', bhava: 1, tone: 'ashubha', keywords: ['शोक', 'स्वजनविरह', 'रक्तपित्त'], phala: 'Inward grief, separation from one\'s own people, and bilious, hot disease.' },
  { verseId: 'phaladipika.26.13', graha: 'mars', bhava: 2, tone: 'ashubha', keywords: ['वित्तभय', 'वाग्दोष', 'अर्थक्षय'], phala: 'Fear about wealth, fault in speech, and loss of money.' },
  { verseId: 'phaladipika.26.13', graha: 'mars', bhava: 3, tone: 'shubha', keywords: ['जय', 'स्वर्णभूषण', 'प्रमोद'], phala: 'Victory, gold ornaments, and gladness.' },
  { verseId: 'phaladipika.26.13', graha: 'mars', bhava: 4, tone: 'ashubha', keywords: ['स्थानभ्रंश', 'उदररोग', 'बन्धुदुःख'], phala: 'Loss of position, disease of the stomach, and sorrow from kin.' },
  { verseId: 'phaladipika.26.14', graha: 'mars', bhava: 5, tone: 'ashubha', keywords: ['ज्वर', 'चिन्ता', 'पुत्रव्यथा', 'कलह'], phala: 'Fever, unseasonable anxiety, distress over children, and quarrels.' },
  { verseId: 'phaladipika.26.14', graha: 'mars', bhava: 6, tone: 'shubha', keywords: ['रिपुकलहनिवृत्ति', 'रोगशान्ति', 'विजय', 'धनाप्ति'], phala: 'Cessation of enmity and quarrels, cure of disease, victory, gain of wealth, and success in all undertakings.' },
  { verseId: 'phaladipika.26.15', graha: 'mars', bhava: 7, tone: 'ashubha', keywords: ['कलत्रकलह', 'अक्षिरुज', 'जठररोग'], phala: 'Quarrels with the spouse, eye disease, and stomach disease.' },
  { verseId: 'phaladipika.26.15', graha: 'mars', bhava: 8, tone: 'ashubha', keywords: ['ज्वर', 'क्षत', 'वित्तहानि', 'मानहानि'], phala: 'Fever, injury, wasting, and loss of wealth and honour.' },
  { verseId: 'phaladipika.26.15', graha: 'mars', bhava: 9, tone: 'ashubha', keywords: ['परिभव', 'अर्थनाश', 'धातुक्षय'], phala: 'Humiliation through loss of money, slow progress, a weak body and wasting of the dhātus.' },
  { verseId: 'phaladipika.26.16', graha: 'mars', bhava: 10, tone: 'ashubha', keywords: ['दुश्चेष्टा', 'कर्मविघ्न', 'श्रम'], phala: 'Wrong action, obstruction in work, and fatigue.' },
  { verseId: 'phaladipika.26.16', graha: 'mars', bhava: 11, tone: 'shubha', keywords: ['द्रव्यवृद्धि', 'आरोग्य', 'क्षेत्रवृद्धि'], phala: 'Increase of wealth, of health, and of land.' },
  { verseId: 'phaladipika.26.16', graha: 'mars', bhava: 12, tone: 'ashubha', keywords: ['द्रव्यच्छेद', 'ताप', 'उष्णामय'], phala: 'Loss of wealth, burning heat, and febrile disease.' },

  // ---- Budha (26.17) ----
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 1, tone: 'ashubha', keywords: ['वित्तक्षय'], phala: 'Loss of wealth.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 2, tone: 'shubha', keywords: ['श्री'], phala: 'Prosperity.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 3, tone: 'ashubha', keywords: ['अरातिभय'], phala: 'Fear from enemies.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 4, tone: 'shubha', keywords: ['धनाप्ति'], phala: 'Gain of wealth.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 5, tone: 'ashubha', keywords: ['कलह'], phala: 'Quarrel with spouse and children.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 6, tone: 'shubha', keywords: ['विजय'], phala: 'Victory.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 7, tone: 'ashubha', keywords: ['विरोध'], phala: 'Opposition.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 8, tone: 'shubha', keywords: ['पुत्रार्थलाभ'], phala: 'Gain of children and of wealth.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 9, tone: 'ashubha', keywords: ['विघ्न'], phala: 'Obstacles.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 10, tone: 'shubha', keywords: ['अशेषसौख्य'], phala: 'Unfailing comfort.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 11, tone: 'shubha', keywords: ['पुष्टि'], phala: 'Nourishment and prosperity.' },
  { verseId: 'phaladipika.26.17', graha: 'mercury', bhava: 12, tone: 'ashubha', keywords: ['पराभवभय'], phala: 'Fear of defeat and humiliation.' },

  // ---- Guru (26.18–26.20) ----
  { verseId: 'phaladipika.26.18', graha: 'jupiter', bhava: 1, tone: 'ashubha', keywords: ['देशान्तरगमन', 'अर्थच्युति', 'शत्रुता'], phala: 'Leaving one\'s country, loss of wealth, and enmity.' },
  { verseId: 'phaladipika.26.18', graha: 'jupiter', bhava: 2, tone: 'shubha', keywords: ['द्रविण', 'कुटुम्बसुख', 'वाक्फल'], phala: 'Wealth, happiness in the family, and fruit of one\'s words.' },
  { verseId: 'phaladipika.26.18', graha: 'jupiter', bhava: 3, tone: 'ashubha', keywords: ['स्थितिनाश', 'इष्टवियुति', 'कार्यान्तराय'], phala: 'Loss of standing, separation from what one holds dear, and obstruction in undertakings.' },
  { verseId: 'phaladipika.26.18', graha: 'jupiter', bhava: 4, tone: 'ashubha', keywords: ['रुज', 'बन्धुदुःख', 'दैन्य', 'चतुष्पाद्भय'], phala: 'Disease, sorrow from relatives, poverty, and fear from four-footed creatures.' },
  { verseId: 'phaladipika.26.19', graha: 'jupiter', bhava: 5, tone: 'shubha', keywords: ['पुत्रोत्पत्ति', 'सज्जनयुति', 'राजानुकूल्य'], phala: 'Birth of children, the company of good people, and the favour of rulers.' },
  { verseId: 'phaladipika.26.19', graha: 'jupiter', bhava: 6, tone: 'ashubha', keywords: ['रिपुपीडा', 'ज्ञातिपीडा', 'व्याधि'], phala: 'Enemies press hard, one\'s own kin press hard, and disease.' },
  { verseId: 'phaladipika.26.19', graha: 'jupiter', bhava: 7, tone: 'shubha', keywords: ['यात्रा', 'वनितासौख्य', 'सुताप्ति'], phala: 'Auspicious journeys, happiness with one\'s wife, and gain of children.' },
  { verseId: 'phaladipika.26.19', graha: 'jupiter', bhava: 8, tone: 'ashubha', keywords: ['मार्गक्लेश', 'अरिष्ट', 'धनकष्ट'], phala: 'Trouble on the road, calamity, and distress through loss of wealth.' },
  { verseId: 'phaladipika.26.20', graha: 'jupiter', bhava: 9, tone: 'shubha', keywords: ['सौभाग्यसिद्धि'], phala: 'Success in every kind of good fortune.' },
  { verseId: 'phaladipika.26.20', graha: 'jupiter', bhava: 10, tone: 'ashubha', keywords: ['पीडा'], phala: 'Affliction to wealth, position, and children.' },
  { verseId: 'phaladipika.26.20', graha: 'jupiter', bhava: 11, tone: 'shubha', keywords: ['लाभ'], phala: 'Gain of children, of position, and of honour.' },
  { verseId: 'phaladipika.26.20', graha: 'jupiter', bhava: 12, tone: 'ashubha', keywords: ['दुःख', 'साध्वस'], phala: 'Sorrow and fear on account of wealth.' },

  // ---- Shukra (26.21) ----
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 1, tone: 'shubha', keywords: ['विषयभोग'], phala: 'Enjoyment of every kind of object of desire.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 2, tone: 'shubha', keywords: ['वित्तसिद्धि'], phala: 'Success in wealth.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 3, tone: 'shubha', keywords: ['विभूति'], phala: 'Power and abundance.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 4, tone: 'shubha', keywords: ['सुख', 'सुहृद्वृद्धि'], phala: 'Increase of comfort and of friends.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 5, tone: 'shubha', keywords: ['पुत्रलब्धि'], phala: 'Gain of children.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 6, tone: 'ashubha', keywords: ['विपत्ति'], phala: 'Calamity.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 7, tone: 'ashubha', keywords: ['युवतिपीडा'], phala: 'Distress arising from women.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 8, tone: 'mishra', keywords: ['सम्पद्'], phala: 'Wealth — stated plainly, though the eighth is not an easy house.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 9, tone: 'shubha', keywords: ['सुखाप्ति'], phala: 'Attainment of happiness.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 10, tone: 'ashubha', keywords: ['कलह'], phala: 'Quarrel.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 11, tone: 'shubha', keywords: ['अभय'], phala: 'Freedom from fear.' },
  { verseId: 'phaladipika.26.21', graha: 'venus', bhava: 12, tone: 'mishra', keywords: ['अर्थप्राप्ति'], phala: 'Gain of wealth — in the house of loss.' },

  // ---- Shani (26.22, 26.23) ----
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 1, tone: 'ashubha', keywords: ['रोग', 'अशौच'], phala: 'Disease and ritual impurity.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 2, tone: 'ashubha', keywords: ['धनसुतविहति'], phala: 'Loss of wealth and of children.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 3, tone: 'shubha', keywords: ['स्थान', 'भृत्य', 'अर्थलाभ'], phala: 'Gain of position, of servants, and of wealth.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 4, tone: 'ashubha', keywords: ['स्त्रीबन्ध्वर्थप्रणाश'], phala: 'Loss of wife, of relatives, and of wealth.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 5, tone: 'ashubha', keywords: ['द्रविणसुतप्रच्युति'], phala: 'Falling away of wealth and of children.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 6, tone: 'shubha', keywords: ['सर्वसौख्य'], phala: 'Every kind of happiness.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 7, tone: 'ashubha', keywords: ['स्त्रीरोग', 'अध्व', 'भीति'], phala: 'Distress through women, disease, journeys, and fear.' },
  { verseId: 'phaladipika.26.22', graha: 'saturn', bhava: 8, tone: 'ashubha', keywords: ['सुतपशुसुहृद्वित्तनाश', 'आमय'], phala: 'Loss of children, cattle, friends and wealth, with disease.' },
  { verseId: 'phaladipika.26.23', graha: 'saturn', bhava: 9, tone: 'ashubha', keywords: ['दारिद्र्य', 'धर्मविघ्न', 'पितृविलय', 'नित्यदुःख'], phala: 'Poverty, obstruction to dharma, loss of the father, and constant sorrow.' },
  { verseId: 'phaladipika.26.23', graha: 'saturn', bhava: 10, tone: 'ashubha', keywords: ['दुर्व्यापार', 'मानभङ्ग', 'रुज'], phala: 'Engagement in bad work, loss of honour, and disease.' },
  { verseId: 'phaladipika.26.23', graha: 'saturn', bhava: 11, tone: 'shubha', keywords: ['सौख्य', 'विभवप्राप्ति', 'कीर्ति'], phala: 'Comforts, gain of wealth of many kinds, and high reputation.' },
  { verseId: 'phaladipika.26.23', graha: 'saturn', bhava: 12, tone: 'ashubha', keywords: ['व्यर्थकार्य', 'विसुहृति', 'व्याधि'], phala: 'Rest, work that comes to nothing, loss of friends, and affliction through wife, children and disease.' },

  // ---- Rahu (26.24) ----
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 1, tone: 'ashubha', keywords: ['देहक्षय'], phala: 'Wasting of the body.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 2, tone: 'ashubha', keywords: ['वित्तविनाश'], phala: 'Destruction of wealth.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 3, tone: 'shubha', keywords: ['सौख्य'], phala: 'Happiness.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 4, tone: 'ashubha', keywords: ['दुःख'], phala: 'Sorrow.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 5, tone: 'ashubha', keywords: ['अर्थनाश'], phala: 'Loss of wealth.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 6, tone: 'ashubha', keywords: ['सुखनाश'], phala: 'Loss of comfort.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 7, tone: 'ashubha', keywords: ['मृत्यु'], phala: 'The verse names death here; read it as the gravest of the series.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 8, tone: 'ashubha', keywords: ['हानि'], phala: 'Loss.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 9, tone: 'shubha', keywords: ['लाभ'], phala: 'Gain.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 10, tone: 'shubha', keywords: ['सुभग'], phala: 'Good fortune.' },
  { verseId: 'phaladipika.26.24', graha: 'rahu', bhava: 11, tone: 'mishra', keywords: ['व्यय'], phala: 'Expenditure.' },
];
