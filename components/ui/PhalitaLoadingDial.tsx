'use client';

/**
 * Phalita — Astronomical Engine Loading Component
 * Replaced the old AI-beam & box dial with CelestialArmillaryLoading
 * to ensure complete backward compatibility without any generic or AI-slop animations.
 */

import React from 'react';
import { CelestialArmillaryLoading } from './CelestialArmillaryLoading';

interface PhalitaLoadingDialProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  isOverlay?: boolean;
  className?: string;
  mode?: 'workspace' | 'panchanga' | 'general';
}

export function PhalitaLoadingDial({
  title = 'Phalita Calculation Engine',
  subtitle,
  fullScreen = false,
  isOverlay = false,
  className = '',
}: PhalitaLoadingDialProps) {
  return (
    <CelestialArmillaryLoading
      fullScreen={fullScreen}
      isOverlay={isOverlay}
      title={title}
      subtitle={subtitle}
      className={className}
    />
  );
}
