import React from 'react';
import { PhalitaLoadingDial } from '@/components/ui/PhalitaLoadingDial';

export default function RootLoading() {
  return (
    <PhalitaLoadingDial
      fullScreen
      title="Phalita Astronomical Engine"
      subtitle="Loading Computational Ephemeris & Jyotiṣa Matrices..."
    />
  );
}
