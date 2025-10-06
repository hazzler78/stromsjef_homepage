"use client";

import React, { useRef, useState } from 'react';
import styled from 'styled-components';

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

const Frame = styled.div<{ $height: string; $isDragging?: boolean }>`
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
  cursor: ${(p) => p.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  touch-action: pan-x; /* Allow horizontal panning for native inertial scroll */
  
  &:active {
    cursor: grabbing;
  }
`;

const Scroller = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  /* Avoid smooth here to not fight rAF auto-scroll */
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch; /* iOS inertial scrolling */
  will-change: scroll-position;
  overscroll-behavior-x: contain; /* avoid parent scroll chaining */
  contain: content; /* isolate layout/paint for smoother scrolling */
  touch-action: pan-x;
  backface-visibility: hidden;
  perspective: 1000px;

  /* Hide scrollbar visually while keeping accessibility */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar { display: none; }

  /* Tighter spacing on medium and small screens */
  @media (max-width: 1024px) {
    gap: 0.75rem;
  }
  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const Slide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  /* Larger cards on desktop: 2 per view */
  flex: 0 0 50%;
  height: 100%;
  padding: 0 0.25rem;

  /* Keep 2 cards on small tablets */
  @media (max-width: 1024px) {
    flex-basis: 50%;
    min-width: 50%;
  }

  /* 1 card on typical phones */
  @media (max-width: 640px) {
    flex-basis: 50%;
    min-width: 100%;
    flex-basis: 100%;
  }

  img {
    width: 100%;
    height: auto;
    max-height: 100%;
    object-fit: contain;
    display: block;
    /* Removing heavy filters during scroll to reduce paint cost */
    /* filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15)); */
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
  className,
}: TrustpilotCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const startScrollLeft = useRef<number>(0);
  const wheelAccum = useRef<number>(0);
  const wheelRaf = useRef<number | null>(null);

  // Auto-scroll with seamless looping
  React.useEffect(() => {
    let raf: number;
    let last = performance.now();
    const step = (now: number) => {
      const el = scrollerRef.current;
      // Cap dt to keep movement consistent and avoid large jumps
      const dt = Math.min(24, now - last);
      last = now;
      if (el && !isPaused && !isDragging) {
        const speedPxPerSec = 120; // tuned speed
        const dx = (speedPxPerSec * dt) / 1000;
        el.scrollLeft += dx;
        const half = el.scrollWidth / 2;
        // Use modulo-like wrap to prevent visible jump
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft = el.scrollLeft - half;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, isDragging]);

  // Mouse drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = e.clientX;
    startScrollLeft.current = scrollerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollerRef.current) return;
    // Stop auto scroll while user interacts to avoid fighting input
    if (!isPaused) setIsPaused(true);
    const dx = e.clientX - dragStartX.current;
    scrollerRef.current.scrollLeft = startScrollLeft.current - dx;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
  };

  // Touch uses native inertial scrolling; no JS handlers needed

  // Map vertical wheel to horizontal scroll on the scroller element
  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 0.5) return;
    
    // Only preventDefault if we can actually prevent it
    try {
      e.preventDefault();
    } catch (err) {
      // Ignore passive event listener errors
    }
    
    wheelAccum.current += delta;
    if (!wheelRaf.current) {
      wheelRaf.current = requestAnimationFrame(() => {
        if (scrollerRef.current) {
          scrollerRef.current.scrollLeft += wheelAccum.current;
        }
        wheelAccum.current = 0;
        wheelRaf.current = null;
      });
    }
  };

  return (
    <CarouselSection className={className}>
      <div className="container">
        <Frame
          $height={height}
          $isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Scroller
            ref={scrollerRef}
            onWheel={handleWheel}
          >
            {images.concat(images).map((src, idx) => (
              <Slide key={`${src}-${idx}`}>
                <img src={src} alt="Trustpilot omdöme" loading={idx < images.length ? 'eager' : 'lazy'} />
              </Slide>
            ))}
          </Scroller>
        </Frame>
      </div>
    </CarouselSection>
  );
}


