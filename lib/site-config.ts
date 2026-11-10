import { PHALITA_SECTIONS } from './phalita/sections';

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isPlaceholder?: boolean;
}

export const SITE_CONFIG = {
  name: 'Phalita',
  nameAscii: 'Phalita',
  sanskrit: 'फलित',
  descriptor: 'Jyotiṣa Prediction',
  tagline:
    'Structured Jyotiṣa predictions from calculated horoscope data — every verdict traceable to a classical rule.',
  ecosystem: {
    label: 'JYOTARA',
    stages: [
      { name: 'GAṆAKA', verb: 'Calculate', href: 'https://apsideslabs.github.io/ganaka/', current: false },
      { name: 'PHALITA', verb: 'Predict', href: '/', current: true },
      { name: 'ANVEṢAṆA', verb: 'Investigate', href: '', current: false },
      { name: 'ADHĪTI', verb: 'Learn', href: '', current: false },
    ],
  },
  navItems: [
    { label: 'Readings', href: '/reading' },
    { label: 'About', href: '/about' },
    { label: 'Research', href: '/research' },
    { label: 'Documentation', href: '/documentation' },
  ] satisfies NavItem[],
  sectionItems: PHALITA_SECTIONS.map((s) => ({
    label: s.title,
    href: `/${s.slug}`,
    description: s.tagline,
    order: s.order,
  })),
  workspaceItem: {
    label: 'Reading Workspace',
    href: '/workspace',
    ctaLabel: 'Open the Reading Workspace',
  },
  footerLinks: {
    product: [
      { label: 'Overview', href: '/' },
      { label: 'Individual Horoscope', href: '/reading' },
      { label: 'Career', href: '/career' },
      { label: 'Marriage', href: '/marriage' },
      { label: 'Reading Workspace', href: '/workspace' },
    ],
    readings: PHALITA_SECTIONS.map((s) => ({ label: s.title, href: `/${s.slug}` })),
    research: [
      { label: 'Classical Texts', href: '/research#classical-texts' },
      { label: 'Rule Provenance', href: '/research#rule-provenance' },
      { label: 'Verification', href: '/research#verification' },
      { label: 'Known Limitations', href: '/documentation#limitations' },
    ],
    documentation: [
      { label: 'System Overview', href: '/documentation' },
      { label: 'Prediction Protocol', href: '/documentation#protocol' },
      { label: 'Synthesis Weights', href: '/documentation#weights' },
      { label: 'Changelog', href: '/documentation#changelog' },
    ],
    about: [
      { label: 'What is Phalita?', href: '/about' },
      { label: 'The JYOTARA Ecosystem', href: '/about#ecosystem' },
      { label: 'Contact & Inquiry', href: '/about#contact' },
    ],
  },
};
