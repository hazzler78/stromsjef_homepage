"use client";

import React from 'react';
import styled, { keyframes } from 'styled-components';

type TrustpilotCarouselProps = {
  images?: string[];
  /**
   * Height of the carousel. Defaults to a responsive clamp suitable for 2400x800 assets.
   */
  height?: string;
  /**
   * Animation duration in seconds for one full loop.
   */
  durationSeconds?: number;
  className?: string;
};

const CarouselSection = styled.section`
  padding: calc(var(--section-spacing) * 0.5) 0;
  background: transparent;
`;

const Frame = styled.div<{ $height: string }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: ${(p) => p.$height};
  border-radius: var(--radius-lg);
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
`;

const marquee = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
`;

const Lane = styled.div<{ $duration: number; $offsetPercent: number }>`
  position: absolute;
  top: 0;
  left: ${(p) => p.$offsetPercent}%;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  height: 100%;
  white-space: nowrap;
  will-change: transform;
  animation: ${marquee} linear infinite;
  animation-duration: ${(p) => p.$duration}s;

  &:hover { animation-play-state: paused; }
`;

const Slide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 80%;
  height: 100%;
  padding: 0.25rem 0.5rem;

  /* Show 2 on tablets, 4 on desktops */
  @media (min-width: 640px) {
    flex-basis: 50%;
  }
  @media (min-width: 1024px) {
    flex-basis: 25%;
  }

  img {
    width: 100%;
    height: auto;
    max-height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
  }
`;

export default function TrustpilotCarousel({
  images = [
    '/trustpilot/trustpilot-02.png',
    '/trustpilot/trustpilot-03.png',
    '/trustpilot/trustpilot-04.png',
    '/trustpilot/trustpilot-01.png',
  ],
  height = 'clamp(110px, 11vw, 180px)',
  durationSeconds = 40,
  className,
}: TrustpilotCarouselProps) {
  return (
    <CarouselSection className={className}>
      <div className="container">
        <Frame $height={height}>
          <Lane $duration={durationSeconds} $offsetPercent={0}>
            {images.map((src, idx) => (
              <Slide key={`lane1-${src}-${idx}`}>
                <img src={src} alt="Trustpilot omdöme" loading={idx < 2 ? 'eager' : 'lazy'} />
              </Slide>
            ))}
          </Lane>
          <Lane $duration={durationSeconds} $offsetPercent={100}>
            {images.map((src, idx) => (
              <Slide key={`lane2-${src}-${idx}`}>
                <img src={src} alt="Trustpilot omdöme" loading="lazy" />
              </Slide>
            ))}
          </Lane>
        </Frame>
      </div>
    </CarouselSection>
  );
}


