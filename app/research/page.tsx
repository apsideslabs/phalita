import React from 'react';
import type { Metadata } from 'next';
import { ResearchView } from '@/components/research/ResearchView';

export const metadata: Metadata = {
  title: 'Phalita — Research',
  description:
    'The classical sources behind every reading rule, how provenance is recorded, and what has actually been verified.',
  openGraph: {
    title: 'Phalita — Research',
    description:
      'The classical sources behind every reading rule, how provenance is recorded, and what has actually been verified.',
    type: 'website',
  },
};

export default function ResearchPage() {
  return <ResearchView />;
}
