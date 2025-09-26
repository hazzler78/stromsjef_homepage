"use client";

import React, { useRef, useState } from 'react';
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
  backface-visibility: hidden;
`;

const scroll = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
`;

const Track = styled.div<{ $duration: number; $reverse?: boolean; $isPaused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 200%;
  animation: ${scroll} linear infinite;
  animation-duration: ${(p) => p.$duration}s;
  animation-direction: ${(p) => (p.$reverse ? 'reverse' : 'normal')};
  animation-play-state: ${(p) => (p.$isPaused ? 'paused' : 'running')};
  will-change: transform;
  touch-action: pan-x;
`;

const Slide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 25%;
  height: 100%;
  padding: 0.25rem 0.5rem;

  /* Show 4 cards on all screen sizes, but allow swiping */
  @media (max-width: 640px) {
    flex-basis: 25%;
    min-width: 25%;
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
  height = 'clamp(160px, 20vw, 240px)',
  durationSeconds = 24,
  className,
}: TrustpilotCarouselProps) {
  const sequence = [...images, ...images];
  const frameRef = useRef<HTMLDivElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [reverse, setReverse] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const decayTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartX = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const velocity = useRef<number>(0);
  const lastTime = useRef<number>(0);

  const queueDecay = () => {
    if (decayTimer.current) clearTimeout(decayTimer.current);
    decayTimer.current = setTimeout(() => setSpeedMultiplier(1), 2000);
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const direction = e.deltaY > 0 || e.deltaX > 0 ? false : true; // down/right -> normal, up/left -> reverse
    setReverse(!direction);
    const delta = Math.min(8, Math.max(1, speedMultiplier + Math.abs(e.deltaY || e.deltaX) / 300));
    setSpeedMultiplier(delta);
    queueDecay();
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    dragStartX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
    lastTime.current = Date.now();
    velocity.current = 0;
    setIsPaused(true);
  };
  
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (dragStartX.current == null || lastTouchX.current == null) return;
    
    const currentX = e.touches[0].clientX;
    const currentTime = Date.now();
    const deltaX = currentX - lastTouchX.current;
    const deltaTime = currentTime - lastTime.current;
    
    // Calculate velocity for momentum
    if (deltaTime > 0) {
      velocity.current = deltaX / deltaTime;
    }
    
    setReverse(deltaX > 0); // swipe right -> reverse
    
    // iPhone-like momentum: gentle speed changes
    const speedFactor = Math.min(2.5, Math.max(1.1, 1 + Math.abs(deltaX) / 200));
    setSpeedMultiplier(speedFactor);
    
    lastTouchX.current = currentX;
    lastTime.current = currentTime;
    e.preventDefault();
  };
  
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    dragStartX.current = null;
    lastTouchX.current = null;
    
    // Apply momentum based on velocity
    if (Math.abs(velocity.current) > 0.5) {
      const momentumMultiplier = Math.min(3, Math.max(1.5, 1 + Math.abs(velocity.current) * 2));
      setSpeedMultiplier(momentumMultiplier);
    }
    
    setIsPaused(false);
    queueDecay();
  };

  return (
    <CarouselSection className={className}>
      <div className="container">
        <Frame
          $height={height}
          ref={frameRef}
          onWheel={handleWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Track $duration={durationSeconds / speedMultiplier} $reverse={reverse} $isPaused={isPaused}>
            {sequence.map((src, idx) => (
              <Slide key={`${src}-${idx}`}>
                <img src={src} alt="Trustpilot omdöme" loading={idx < images.length ? 'eager' : 'lazy'} />
              </Slide>
            ))}
          </Track>
        </Frame>
      </div>
    </CarouselSection>
  );
}


