import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorkspaceClient } from '@/components/workspace/WorkspaceClient';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';

export const metadata: Metadata = {
  title: 'Phalita — Reading Workspace',
  description:
    'Eleven classical readings of a calculated horoscope — career, education, marriage, wealth, health, daśā timing, transits and event timing, with every verdict traced to its source.',
  openGraph: {
    title: 'Phalita — Reading Workspace',
    description:
      'Eleven classical readings of a calculated horoscope — career, education, marriage, wealth, health, daśā timing, transits and event timing, with every verdict traced to its source.',
  },
};

export default function WorkspacePage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FDFCF8]">
      <Suspense
        fallback={
          <CelestialArmillaryLoading
            fullScreen
            title="Phalita Astronomical Workstation"
          />
        }
      >
        <WorkspaceClient />
      </Suspense>
    </div>
  );
}
