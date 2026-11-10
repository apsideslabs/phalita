/**
 * Phaladīpikā, adhyāya 9 — राशिफलम् (rāśi phala).
 *
 * The twelve readings a pañjikā prints: what the text says of a person whose
 * Moon occupies each rāśi. This is the reading the Kāmarūpa almanac tradition
 * begins with — the janma rāśi first, the lagna second — and 9.13 states the
 * rule that makes it legitimate: what is said for the lagna is to be said for
 * the Candra lagna as well.
 *
 * Text from the Sanskrit Wikisource e-text (CC BY-SA 4.0). The English is this
 * platform's reading of the Sanskrit.
 */

import type { PhalaVerse, RashiPhala } from './types';
import type { RashiNumber } from '@/lib/jyotisha/types';

export const PHALADIPIKA_09_VERSES: PhalaVerse[] = [
  {
    id: 'phaladipika.9.1',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '1',
    subject: 'Meṣa (Aries)',
    mula:
      'वृत्तेक्षणो दुर्बलजानुरुग्रो भीरुर्जले स्याल्लघुभुक् सुकामी। संचारशीलश्चपलोऽनृतोक्तिव्रणाण्किताङ्गः क्रियभे प्रजातः॥ १॥',
  },
  {
    id: 'phaladipika.9.2',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '2',
    subject: 'Vṛṣabha (Taurus)',
    mula:
      'पृथूरुवक्त्रः कृषिकर्मकृत्स्यान्-मध्यान्तसौख्यः प्रमदाप्रियश्च। त्यागी क्षमी क्लेशसहश्च गोमान् पृष्ठास्यपश्वेरङ्कयुतो पृषोत्थः॥ २॥',
  },
  {
    id: 'phaladipika.9.3',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '3',
    subject: 'Mithuna (Gemini)',
    mula:
      'श्यामेक्षणः कुञ्चितमूर्धजः स्त्रीक्रीडानुरक्तश्च परेङ्गितज्ञः। उत्तुङ्गनासः प्रियगीतनृत्तो वसन् सदान्तः सदने च युग्मे॥ ३॥',
  },
  {
    id: 'phaladipika.9.4',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '4',
    subject: 'Karka (Cancer)',
    mula:
      'स्त्रीनिर्जितः पीनगलः सुमित्रो बह्वालयस्तुङ्गकटिर्धनाढ्यः। ह्रस्वश्च वक्रो द्रुतगः कुलीरे मेधान्वितस्तोयरतोऽल्पपुत्रः॥ ४॥',
  },
  {
    id: 'phaladipika.9.5',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '5',
    subject: 'Siṃha (Leo)',
    mula:
      'पिङ्गोक्षणः स्थूलहनुर्विशालवक्त्रोऽभिमानी सपराक्रमः स्यात्। कुप्यत्यकार्ये वनशैलगामि मातुर्विधेयः स्थिरधीर्मृगेन्द्रे॥ ५॥',
  },
  {
    id: 'phaladipika.9.6',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '6',
    subject: 'Kanyā (Virgo)',
    mula:
      'स्रस्तांसबाहुः परवित्तगेहैः संपूजते सत्यरतः प्रियोक्तिः। व्रीडालसाक्षः सुरतप्रियः स्याच्छास्त्रार्थविच्चाल्पसुतोऽङ्गनायाम्॥ ६॥',
  },
  {
    id: 'phaladipika.9.7',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '7',
    subject: 'Tulā (Libra)',
    mula:
      'चलत्कृशाङ्गोऽल्पसुतोऽतिभक्तो देवद्विजानामटनो द्विनामा। प्रांशुश्च दक्षः क्रयविक्रयेषु धीरोऽदयस्तौलिनि मध्यवादी॥ ७॥',
  },
  {
    id: 'phaladipika.9.8',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '8',
    subject: 'Vṛścika (Scorpio)',
    mula:
      'वृत्तोरुजङ्घः पृथुनेत्रवक्षा रोगी शिशुत्वे गुरुतातहीनः। क्रूरक्रियो राजकुलाभिमुख्यः कीटेऽब्जरेखाङ्कितपाणिपादः॥ ८॥',
  },
  {
    id: 'phaladipika.9.9',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '9',
    subject: 'Dhanu (Sagittarius)',
    mula:
      'दीर्घास्यकण्ठः पृथुकर्णनासः कर्मोद्यतः कुब्जतनुर्नृपेष्टः। प्रागल्भ्यवाक्त्यागयुतोऽरिहन्ता साम्नैकसाध्योऽश्विभवो बलाधयः॥ ९॥',
  },
  {
    id: 'phaladipika.9.10',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '10',
    subject: 'Makara (Capricorn)',
    mula:
      'अधः कृशः सत्त्वयुतो गृहीतवाक्योऽलसोऽगम्यजराङ्गनेष्टः धर्मध्वजो भाग्ययुतोऽटनश्च वातार्दितो नक्रभवो विलज्जः॥ १०॥',
  },
  {
    id: 'phaladipika.9.11',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '11',
    subject: 'Kumbha (Aquarius)',
    mula:
      'प्रच्छन्नपापो घटतुल्यदेहो विघातदक्षोऽध्वसहोऽल्पवित्तः। लुब्धः परार्थी क्षयवृद्धियुक्तो घटोद्भवः स्यात्प्रियगन्धपुष्पः॥ ११॥',
  },
  {
    id: 'phaladipika.9.12',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '12',
    subject: 'Mīna (Pisces)',
    mula:
      'भ्रात्र्यम्बुपानः समचारुदेहः स्वदारगस्तोयजवित्तभोक्ता। विद्वान्कृतज्ञोऽभिभवत्यमित्रान् शुभेक्षणो भाग्ययुतोऽन्त्यराशौ॥ १२॥',
  },
  {
    id: 'phaladipika.9.13',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '13',
    subject: 'The same phala is to be read from the Candra lagna',
    mula:
      'राशेः स्वभावाश्रयरूपवर्णान् ज्ञात्वानुरूपाणि फलानि तस्य। युक्त्या वदेदत्र फलं विलग्ने यच्चन्द्रलग्नेऽपि तदेव वाच्यम्॥ १३॥',
  },
  {
    id: 'phaladipika.9.14',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '14',
    subject: 'A graha in its own exaltation',
    mula:
      'प्रहे सति निजोच्चगे भवति रत्नगर्भधिपो महीपतिकृतस्तुतिर्महितसंपदामालयः। उदारगुणसंयुतो जयति विक्रमार्को यथा नये यशसि विक्रमे वितरणे धृतौ कौशले॥ १४॥',
  },
  {
    id: 'phaladipika.9.15',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '15',
    subject: 'A graha in the house of a benefic',
    mula:
      'स्वमिन्दरगते ग्रहे प्रभुपरिग्रहादार्यतिं प्रभुत्वमपि वा गृहस्थितिमचञ्चलां प्राप्नुयात्। नवं भुवनमुर्वराक्षितिमुपैति काले स्वके जने बहुमतिं पुनः सकलनष्टवस्तून्यपि॥ १५॥',
  },
  {
    id: 'phaladipika.9.16',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '16',
    subject: 'A graha in a friend\'s house',
    mula:
      'ग्रहः सुहृत्क्षेत्रगतः सुहृद्भिः कार्यस्य सिद्धिं नवसौहृदं च। सत्पुत्रजायाधनधान्यभाग्यं ददात्ययं सर्वजनानुकूल्यम्॥ १६॥',
  },
  {
    id: 'phaladipika.9.17',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '17',
    subject: 'A graha in an enemy\'s house',
    mula:
      'गते ग्रहे शत्रुगृहं निकृष्टतां परान्नवृत्ति परमन्दिरस्थितिम्। अर्किचनत्वं रिपुपीडनं सदा स्निग्धोऽपि तस्यातिरिपुत्वमाप्नुयात्॥ १७॥',
  },
  {
    id: 'phaladipika.9.18',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '18',
    subject: 'A graha in its debilitation',
    mula:
      'नीचे ग्रहेऽधः पतनं स्ववृत्तेर्दैन्यं दुराचारमृणाप्तिमाहुः। नीचाश्रयं कीकटदेशवासं मृत्युत्वमध्वानमनर्थकार्यम्॥ १८॥',
  },
  {
    id: 'phaladipika.9.19',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '19',
    subject: 'A graha in its own sign gives no special phala',
    mula:
      'ग्रहो मौढ्यं प्राप्तो मरणमचिरात् स्त्रीसुतधनैः प्रहीणत्वं व्यर्थे कलहमपवादं परिभवम्। समर्क्षस्थः खेटो न कलयति वैशेषिकफलं सुखं वा दुःखं यज्जनयति यथापूर्वमचलम्॥ १९॥',
  },
  {
    id: 'phaladipika.9.20',
    sourceId: 'phaladipika',
    adhyaya: 9,
    shloka: '20',
    subject: 'A retrograde graha gives its exaltation phala; vargottama gives its own-sign phala',
    mula:
      'वक्रं गतः स्वोच्चफलं विदध्यात्सपत्ननीचर्क्षगतोऽपि खेटः। वर्गोत्तमांशस्थिखेचरोऽपि स्वक्षेत्रगस्योक्तफलानि तद्वत्॥ २०॥',
  },
];

export const PHALADIPIKA_09_RASHIS: RashiPhala[] = [
  { rashi: 1 as RashiNumber, rashiName: 'Meṣa', verseId: 'phaladipika.9.1', keywords: ['वृत्तेक्षण', 'उग्र', 'चपल', 'अनृतोक्ति'], phala: 'Round eyes, weak knees, fierce temper, timid in water; eats little, full of desire, restless and fickle, given to untruth, with marks or scars on the body.' },
  { rashi: 2 as RashiNumber, rashiName: 'Vṛṣabha', verseId: 'phaladipika.9.2', keywords: ['कृषिकर्म', 'त्यागी', 'क्षमी', 'गोमान्'], phala: 'Broad thighs and face, a tiller of the soil; comfort in middle and later life, fond of women; generous, forbearing, able to bear hardship, possessed of cattle, marked on back and face.' },
  { rashi: 3 as RashiNumber, rashiName: 'Mithuna', verseId: 'phaladipika.9.3', keywords: ['श्यामेक्षण', 'स्त्रीक्रीडा', 'गीतनृत्त'], phala: 'Dark eyes, curling hair, fond of the company of women, reads others\' gestures; tall nose, fond of song and dance, always dwelling indoors.' },
  { rashi: 4 as RashiNumber, rashiName: 'Karka', verseId: 'phaladipika.9.4', keywords: ['धनाढ्य', 'मेधाविन्', 'तोयरत'], phala: 'Subdued by women, thick-necked, a good friend, many dwellings, high hips, wealthy; short and crooked, quick in gait, intelligent, fond of water, few children.' },
  { rashi: 5 as RashiNumber, rashiName: 'Siṃha', verseId: 'phaladipika.9.5', keywords: ['अभिमानी', 'पराक्रम', 'स्थिरधी'], phala: 'Tawny eyes, thick jaw, broad face, proud, full of prowess; angered by what should not be done, a wanderer in forests and hills, obedient to his mother, steady of mind.' },
  { rashi: 6 as RashiNumber, rashiName: 'Kanyā', verseId: 'phaladipika.9.6', keywords: ['सत्यरत', 'शास्त्रार्थविद्', 'अल्पसुत'], phala: 'Sloping shoulders and arms, honoured in others\' houses, devoted to truth, pleasant in speech; modest, lazy-eyed, fond of pleasure, learned in the meaning of the śāstras, few children by a wife.' },
  { rashi: 7 as RashiNumber, rashiName: 'Tulā', verseId: 'phaladipika.9.7', keywords: ['देवभक्त', 'क्रयविक्रयदक्ष', 'मध्यवादी'], phala: 'Restless, slender of limb, few children, greatly devoted to the gods and the twice-born; a wanderer, of two names, tall, skilled in buying and selling, steady, unkind, moderate in speech.' },
  { rashi: 8 as RashiNumber, rashiName: 'Vṛścika', verseId: 'phaladipika.9.8', keywords: ['रोगी', 'क्रूरक्रिय', 'राजाभिमुख'], phala: 'Round thighs and shins, broad eyes and chest, sickly in childhood, deprived of a strong father; harsh in action, drawn towards royal houses, hands and feet marked with lines.' },
  { rashi: 9 as RashiNumber, rashiName: 'Dhanu', verseId: 'phaladipika.9.9', keywords: ['कर्मोद्यत', 'नृपेष्ट', 'अरिहन्ता'], phala: 'Long face and neck, broad ears and nose, industrious, slightly humped, dear to kings; bold in speech and generous, a destroyer of enemies, won over by gentle means, troubled by disease of the strength.' },
  { rashi: 10 as RashiNumber, rashiName: 'Makara', verseId: 'phaladipika.9.10', keywords: ['धर्मध्वज', 'भाग्ययुत', 'वातार्दित'], phala: 'Thin below, full of spirit, of accepted speech, lazy, liked by inaccessible women; a flag-bearer of dharma, fortunate, a wanderer, afflicted by wind, modest.' },
  { rashi: 11 as RashiNumber, rashiName: 'Kumbha', verseId: 'phaladipika.9.11', keywords: ['अल्पवित्त', 'लुब्ध', 'प्रियगन्ध'], phala: 'Sin concealed, body like a water-pot, skilled in injury, able to endure the road, of little wealth; greedy, living for others, subject to loss and gain, fond of scents and flowers.' },
  { rashi: 12 as RashiNumber, rashiName: 'Mīna', verseId: 'phaladipika.9.12', keywords: ['विद्वान्', 'कृतज्ञ', 'भाग्ययुत'], phala: 'Given to water and to brothers, of even and pleasing body, attached to his own wife, enjoying water-born wealth; learned, grateful, overcoming enemies, of auspicious glance, fortunate.' },
];
