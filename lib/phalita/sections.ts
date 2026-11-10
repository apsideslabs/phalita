/**
 * PHALITA — the eleven reading sections of the platform.
 *
 * This file is the spine of the site: the header menu, the section landing
 * pages, the reading workspace rail and the footer all read from it. Adding a
 * section here adds it everywhere.
 *
 * Every section maps to a real surface in the workspace — none of these are
 * placeholders. `workspaceTab` is the tab id the workspace opens on, and
 * `domainIds` are the prediction-protocol domains that section evaluates.
 */

export type PhalitaIcon =
  | 'compass'
  | 'briefcase'
  | 'graduation'
  | 'heart'
  | 'coins'
  | 'heart-pulse'
  | 'clock'
  | 'orbit'
  | 'calendar'
  | 'book'
  | 'shield';

export interface PhalitaSection {
  /** URL slug — the page lives at /<slug> */
  slug: string;
  /** Section number, used for display only */
  order: number;
  /** Display title */
  title: string;
  /** Sanskrit title of the bhāva or discipline the section reads */
  sanskrit: string;
  /** One-line summary, used in the menu and the landing hero */
  tagline: string;
  /** Two or three sentences of method, shown on the landing page */
  description: string;
  /** The bhāva / division this section reads */
  primaryBasis: string;
  /** Kārakas the section weighs */
  karakas: string;
  /** Divisional charts consulted */
  vargas: string;
  /** Prediction-protocol domain ids evaluated by this section */
  domainIds: string[];
  /** Workspace tab this section opens on */
  workspaceTab: string;
  /** What the section actually computes, in order */
  method: string[];
  /** Classical works the rules are drawn from */
  sources: string[];
  icon: PhalitaIcon;
}

export const PHALITA_SECTIONS: PhalitaSection[] = [
  {
    slug: 'reading',
    order: 1,
    title: 'Individual Horoscope',
    sanskrit: 'जन्म फल',
    tagline: 'The full twelve-domain reading of a single calculated chart.',
    description:
      'One chart, read end to end. PHALITA takes the calculated horoscope from GAṆAKA and evaluates all twelve life domains through the five-layer synthesis protocol: house lord, natural kāraka, divisional confirmation, aṣṭakavarga bindus, and the running daśā. Every domain carries the classical rule that produced it, the conditions that were met, and the conditions that were not.',
    primaryBasis: 'All twelve bhāvas, with lagna and Candra lagna read together',
    karakas: 'The full eight chara kārakas, plus the natural kārakas of each domain',
    vargas: 'D-1 with D-9, D-10 and the domain varga for each reading',
    domainIds: [
      'lagna_constitution',
      'personality',
      'career',
      'wealth',
      'education',
      'marriage',
      'children',
      'health',
      'family',
      'social_status',
      'spirituality',
      'other_life_indications',
    ],
    workspaceTab: 'indications',
    method: [
      'Assemble the calculated chart: positions, bhāvas, strengths, daśā and divisional charts.',
      'Score each domain on the five weighted layers — lord 40%, kāraka 25%, varga 15%, aṣṭakavarga 10%, daśā 10%.',
      'Apply nīchabhanga, rāja-yoga and virodha-bhanga overrides before any verdict is stated.',
      'Report every satisfied rule with its text and chapter, and every unmet condition beside it.',
      'Attach the timing window from the active mahādaśā and antardaśā rather than a bare prediction.',
    ],
    sources: [
      'Bṛhat Parāśara Horā Śāstra',
      'Phaladīpikā',
      'Sārāvalī',
      'Bṛhat Jātaka',
      'Jaimini Sūtras',
    ],
    icon: 'compass',
  },
  {
    slug: 'career',
    order: 2,
    title: 'Career & Profession',
    sanskrit: 'कर्म भाव',
    tagline: 'Vocation, status and the tenth bhāva read through D-10 and the kārakas.',
    description:
      'The tenth bhāva governs work, standing and what a chart is built to do. PHALITA reads it from the tenth lord, the tenth from Candra lagna, the Daśāṃśa chart, and the kārakas of profession, then ranks vocational fields by capability, interest and success rather than asserting a single career.',
    primaryBasis: 'Daśama bhāva, its lord, and the tenth from Candra lagna',
    karakas: 'Saturn (karma), Sun (authority), Mercury (commerce), Amātyakāraka',
    vargas: 'D-10 (Daśāṃśa) primary, D-1 and D-9 for confirmation',
    domainIds: ['career'],
    workspaceTab: 'career',
    method: [
      'Read the tenth lord’s dignity, placement, aspects, combustion and retrogradation.',
      'Confirm in D-10; a strong D-1 tenth that collapses in D-10 is reported as such, not smoothed over.',
      'Weigh the natural kārakas by ṣaḍbala and by their own placement from the tenth.',
      'Rank vocational fields on three separate indices and report the spread, not just the winner.',
      'Time the maturation window against the daśā of the tenth lord or its kāraka.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Bṛhat Jātaka', 'Sārāvalī'],
    icon: 'briefcase',
  },
  {
    slug: 'education',
    order: 3,
    title: 'Education & Learning',
    sanskrit: 'विद्या भाव',
    tagline: 'The fourth, fifth and ninth bhāvas, with D-24 for formal learning.',
    description:
      'Learning in Jyotiṣa is read across three bhāvas at once: the fourth for early schooling and the ground of knowledge, the fifth for intelligence and retention, the ninth for higher learning and teachers. PHALITA evaluates them together and checks the Caturviṃśāṃśa, which is the divisional chart of education.',
    primaryBasis: 'Caturtha, pañcama and navama bhāvas',
    karakas: 'Mercury (buddhi), Jupiter (jñāna), Venus (arts), Moon (mind)',
    vargas: 'D-24 (Caturviṃśāṃśa) primary, D-1 and D-9',
    domainIds: ['education'],
    workspaceTab: 'education',
    method: [
      'Read the fifth lord and Mercury for the capacity to learn, and the fourth for its foundation.',
      'Check the ninth for higher education and the teacher relationship.',
      'Confirm in D-24; report where D-1 and D-24 disagree.',
      'Distinguish aptitude from opportunity — the lord’s strength from the bhāva’s occupancy.',
      'Time examination and study windows against the daśā of Mercury, Jupiter or the fifth lord.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Sārāvalī'],
    icon: 'graduation',
  },
  {
    slug: 'marriage',
    order: 4,
    title: 'Marriage & Relationships',
    sanskrit: 'कलत्र भाव',
    tagline: 'The seventh bhāva, its lord, Venus, and a two-chart Kuṭa Milan.',
    description:
      'Marriage is read from the seventh bhāva, the seventh from Candra lagna, the lord of the seventh, and Venus as the natural kāraka — with the Navāṃśa as the confirming chart for the spouse. PHALITA reports the reading and, separately, the classical Aṣṭakūṭa matching of two charts, kept apart because a good single chart and a good pairing are different questions.',
    primaryBasis: 'Saptama bhāva, its lord, and the seventh from Candra lagna',
    karakas: 'Venus (kāma), Jupiter (for a woman’s chart), Mars (for a man’s chart)',
    vargas: 'D-9 (Navāṃśa) primary, D-1 and D-7 for progeny',
    domainIds: ['marriage'],
    workspaceTab: 'marriage',
    method: [
      'Read the seventh lord’s dignity and placement, and malefic influence on the seventh.',
      'Check Venus for the capacity for relationship and the Navāṃśa for the spouse’s chart.',
      'Note Maṅgala doṣa and its classical cancellations explicitly, rather than flagging it alone.',
      'Report the timing window from the daśā of the seventh lord or Venus.',
      'For pairing, run the eight kuṭas and show each kūṭa’s score against its maximum.',
    ],
    sources: [
      'Bṛhat Parāśara Horā Śāstra',
      'Phaladīpikā',
      'Sārāvalī',
      'Muhūrta Cintāmaṇi (for kuṭa matching)',
    ],
    icon: 'heart',
  },
  {
    slug: 'finance',
    order: 5,
    title: 'Finance, Wealth & Property',
    sanskrit: 'धन भाव',
    tagline: 'The second, eleventh and fourth bhāvas, with D-2 for accumulated wealth.',
    description:
      'Wealth is not one bhāva. The second governs what is held, the eleventh what accrues, the fourth immovable property, and the Dhana yogas describe how the three combine. PHALITA reads them as a set and checks the Horā chart, which is the divisional chart of wealth.',
    primaryBasis: 'Dvitīya, ekādaśa and caturtha bhāvas',
    karakas: 'Jupiter (dhana), Venus (sampatti), Saturn (accumulation over time)',
    vargas: 'D-2 (Horā) primary, D-1 and D-4 for property',
    domainIds: ['wealth'],
    workspaceTab: 'finance',
    method: [
      'Read the second and eleventh lords, and the yogas that connect them to the lagna lord.',
      'Check the fourth for property and vehicles, separately from liquid wealth.',
      'Confirm in D-2; report the divergence where D-1 and D-2 disagree.',
      'Weigh ṣaḍbala of the dhana kārakas against the bhāva occupancy.',
      'Time accumulation windows against the daśā of the second or eleventh lord.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Sārāvalī', 'Jaimini Sūtras'],
    icon: 'coins',
  },
  {
    slug: 'health',
    order: 6,
    title: 'Health Assessment',
    sanskrit: 'आरोग्य विचार',
    tagline: 'Traditional Jyotiṣa assessment of constitution, vitality and affliction.',
    description:
      'Jyotiṣa reads the body through the lagna, the sixth bhāva and the Moon. PHALITA reports the traditional assessment — constitution, the planets that afflict the lagna, the sixth lord’s condition, and the ariṣṭa indications the classical texts describe. This is a traditional reading and not a medical diagnosis; nothing here substitutes for a physician.',
    primaryBasis: 'Lagna, ṣaṣṭha bhāva, and Candra for mind',
    karakas: 'Sun (vitality), Moon (fluids and mind), Saturn (chronic), Mars (injury)',
    vargas: 'D-1, D-6 (Ṣaṣṭhāṃśa) and D-30 for affliction',
    domainIds: ['health'],
    workspaceTab: 'health',
    method: [
      'Read the lagna and its lord for constitution and baseline vitality.',
      'Check malefic occupancy and dṛṣṭi on the lagna and the sixth, with combustion and retrogradation noted.',
      'Read the sixth lord’s placement — the classical indicator of the site of affliction.',
      'Report ariṣṭa yogas with their classical text and the conditions that cancel them.',
      'State the traditional indication plainly, and state that it is not a medical finding.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Sārāvalī', 'Bṛhat Jātaka'],
    icon: 'heart-pulse',
  },
  {
    slug: 'timing',
    order: 7,
    title: 'Daśā & Timing',
    sanskrit: 'दशा फल',
    tagline: 'Viṃśottarī and the Jaimini systems, read as the clock of the chart.',
    description:
      'A reading without a time is only half a prediction. PHALITA runs the Viṃśottarī hierarchy to six levels, the seven extended daśā systems, and the Jaimini chara daśās, and reports which period is running, what it is capable of, and when the next change falls.',
    primaryBasis: 'The daśā lord’s house, dignity, and relation to the bhāva being timed',
    karakas: 'The daśā lord itself, read against the kāraka of the domain',
    vargas: 'D-1 and D-9, with the daśā lord’s varga dignity',
    domainIds: ['career', 'wealth', 'marriage'],
    workspaceTab: 'vimshottari',
    method: [
      'Compute the Viṃśottarī balance at birth from the Moon’s arc, not from a rounded table.',
      'Walk the hierarchy mahā → antar → pratyantar → sūkṣma → prāṇa → deha.',
      'Read the daśā lord’s capacity from its own dignity and ṣaḍbala before reading the period.',
      'Cross-check with a second system — Aṣṭottarī, Yoginī, Kālacakra or Jaimini chara.',
      'Report the next transition dates rather than an undated prediction.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra (daśā chapters)', 'Jaimini Sūtras', 'Phaladīpikā'],
    icon: 'clock',
  },
  {
    slug: 'transits',
    order: 8,
    title: 'Transit Analysis',
    sanskrit: 'गोचर',
    tagline: 'Gocāra against the natal Moon and lagna, with vedha obstructions.',
    description:
      'Transits are read from the natal Moon, not from the lagna, and every benefic transit is checked for vedha — the obstruction that cancels it. PHALITA computes live positions against both references, tracks Sāḍhē Sātī phase by phase, and flags Aṣṭama Śani and Kaṇṭaka Śani.',
    primaryBasis: 'Gocāra from Candra lagna, with the lagna as the secondary reference',
    karakas: 'Saturn (delay and discipline), Jupiter (expansion), Rāhu (disruption)',
    vargas: 'D-1 natal chart as the reference frame',
    domainIds: ['career', 'health', 'wealth'],
    workspaceTab: 'transits',
    method: [
      'Compute the current transit longitudes for any date, sidereal.',
      'Place each planet in the house it occupies from the natal Moon and from the lagna.',
      'Check the vedha pairs from Phaladīpikā — a benefic house with its vedha occupied is obstructed.',
      'Track Sāḍhē Sātī by phase, and flag Kaṇṭaka and Aṣṭama Śani separately.',
      'Read the transit against the running daśā, since a transit without a daśā is only potential.',
    ],
    sources: ['Phaladīpikā (gocāra chapter)', 'Bṛhat Parāśara Horā Śāstra', 'Sārāvalī'],
    icon: 'orbit',
  },
  {
    slug: 'events',
    order: 9,
    title: 'Event Timing',
    sanskrit: 'काल विचार',
    tagline: 'Life-period analysis: the daśā stack, its transitions, and the transit gates.',
    description:
      'Event timing is where daśā and transit meet. PHALITA assembles the life-period timeline from birth, shows the running mahā–antar–pratyantar stack with the days remaining in each, lists the sub-period transitions ahead, and finds the transit ingresses that open or close a window.',
    primaryBasis: 'The daśā stack read against the bhāva that governs the event',
    karakas: 'The daśā lord and the kāraka of the event domain, weighed together',
    vargas: 'D-1 and D-9, with the domain varga of the event',
    domainIds: ['career', 'marriage', 'wealth', 'children'],
    workspaceTab: 'events',
    method: [
      'Build the life-period timeline from birth, with the native’s age at each mahādaśā boundary.',
      'Report the running mahā, antar and pratyantar lords with their remaining duration.',
      'List the antardaśā and pratyantardaśā transitions inside the coming window.',
      'Find the Saturn, Jupiter and Rāhu ingresses ahead, refined to the day, and the natal house each activates.',
      'State a window, never a date — a classical prediction is a period in which an event is supported.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Jaimini Sūtras'],
    icon: 'calendar',
  },
  {
    slug: 'rules',
    order: 10,
    title: 'Classical Rules',
    sanskrit: 'शास्त्र नियम',
    tagline: 'The rule library — every prediction traced to its text and chapter.',
    description:
      'Every statement PHALITA makes is produced by a rule that exists in the repository, carries a classical citation, and states the conditions it tests. The library is open: you can read the rule, see the exact chart conditions it checks, and see whether they were met in this chart.',
    primaryBasis: 'The canonical rule corpus, independent of any one chart',
    karakas: 'Not applicable — rules are read, not scored',
    vargas: 'Rules declare the varga they test against',
    domainIds: [],
    workspaceTab: 'rules',
    method: [
      'List every canonical rule with its source text, chapter and verse.',
      'Show the conditions each rule tests, in the form the engine evaluates them.',
      'Filter by domain, by source text, and by whether the rule fired for this chart.',
      'Distinguish rules that are fully satisfied from those partially met.',
      'Refuse to score a rule the texts disagree on — contested readings are labelled as contested.',
    ],
    sources: [
      'Bṛhat Parāśara Horā Śāstra',
      'Phaladīpikā',
      'Sārāvalī',
      'Bṛhat Jātaka',
      'Jaimini Sūtras',
      'Muhūrta Cintāmaṇi',
    ],
    icon: 'book',
  },
  {
    slug: 'cases',
    order: 11,
    title: 'Verification & Cases',
    sanskrit: 'प्रमाण',
    tagline: 'The dossier: what was claimed, on what evidence, and whether it held.',
    description:
      'A prediction platform is worth what its verification is worth. PHALITA keeps the dossier for each chart — every domain verdict, the rules behind it, the contradictions found, and the timing window attached. The reference chart in this build is checked against Jagannatha Hora and against printed worked examples in the classical literature.',
    primaryBasis: 'The assembled evidence for every domain verdict',
    karakas: 'Not applicable — this is the audit surface',
    vargas: 'As declared by each rule',
    domainIds: [],
    workspaceTab: 'cases',
    method: [
      'Assemble every domain verdict with its rule evidence and contradiction list.',
      'Record the calculation basis for each — positions, strengths, daśā, varga.',
      'Compare against an independent engine on the reference chart.',
      'Reproduce printed worked examples from the classical texts where they exist.',
      'Keep the known limitations visible rather than buried.',
    ],
    sources: ['Bṛhat Parāśara Horā Śāstra', 'Graha and Bhava Balas (B. V. Raman)'],
    icon: 'shield',
  },
];

export const SECTION_SLUGS = PHALITA_SECTIONS.map((s) => s.slug);

export function getSection(slug: string): PhalitaSection | undefined {
  return PHALITA_SECTIONS.find((s) => s.slug === slug);
}
