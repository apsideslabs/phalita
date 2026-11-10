import React from 'react';
import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';

export const metadata: Metadata = {
  title: 'Phalita — Jyotiṣa Prediction',
  description:
    'Structured Jyotiṣa readings from a calculated horoscope — character, yogas, the twelve houses, marriage, longevity and transits, each line a verse of Phaladīpikā you can open.',
  openGraph: {
    title: 'Phalita — Jyotiṣa Prediction',
    description:
      'Structured Jyotiṣa readings from a calculated horoscope — character, yogas, the twelve houses, marriage, longevity and transits, each line a verse of Phaladīpikā you can open.',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeView />;
}
