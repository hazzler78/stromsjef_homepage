"use client";

import GlassButton from '@/components/GlassButton';

export default function GoHomeButton() {
  return (
    <GlassButton
      variant="primary"
      size="lg"
      onClick={() => window.open('/', '_self')}
      background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
    >
      Tillbaka till startsidan
    </GlassButton>
  );
} 