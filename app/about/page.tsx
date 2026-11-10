import React from 'react';
import type { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';

export const metadata: Metadata = {
  title: 'Phalita — About',
  description:
    'Phalita is the prediction platform of the JYOTARA ecosystem — the step between a calculated horoscope and a structured, classical reading.',
  openGraph: {
    title: 'Phalita — About',
    description:
      'Phalita is the prediction platform of the JYOTARA ecosystem — the step between a calculated horoscope and a structured, classical reading.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutView />;
}
