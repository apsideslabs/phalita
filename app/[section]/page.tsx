import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionLanding } from '@/components/sections/SectionLanding';
import { PHALITA_SECTIONS, getSection } from '@/lib/phalita/sections';

export const dynamicParams = false;

export function generateStaticParams() {
  return PHALITA_SECTIONS.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: 'Section not found' };

  const title = `${section.title} — ${section.sanskrit}`;
  return {
    title,
    description: section.tagline,
    openGraph: {
      title: `${title} | Phalita`,
      description: section.tagline,
      type: 'article',
    },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();
  return <SectionLanding section={section} />;
}
