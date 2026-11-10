import React from 'react';
import type { Metadata } from 'next';
import { DocumentationView } from '@/components/documentation/DocumentationView';

export const metadata: Metadata = {
  title: 'Phalita — Documentation',
  description:
    'The prediction protocol: the five synthesis layers, the overrides applied before a verdict, timing, and known limitations.',
  openGraph: {
    title: 'Phalita — Documentation',
    description:
      'The prediction protocol: the five synthesis layers, the overrides applied before a verdict, timing, and known limitations.',
    type: 'website',
  },
};

export default function DocumentationPage() {
  return <DocumentationView />;
}
