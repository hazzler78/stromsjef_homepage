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
  gap: 1.25rem;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth; /* for programmatic scrolls */
  -webkit-overflow-scrolling: touch; /* iOS inertial scrolling */
  will-change: scroll-position;
  touch-action: pan-x;
  backface-visibility: hidden;
  perspective: 1000px;

  /* Hide scrollbar visually while keeping accessibility */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar { display: none; }

  /* Tighter spacing on small screens */
  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const Slide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 25%;
  height: 100%;
  padding: 0.25rem 0.5rem;

  /* 3 cards on small tablets */
  @media (max-width: 1024px) {
    flex-basis: 33.3333%;
    min-width: 33.3333%;
  }

  /* 2 cards on phones for larger visuals */
  @media (max-width: 640px) {
    flex-basis: 50%;
    min-width: 50%;
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const startScrollLeft = useRef<number>(0);

  // Mouse drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startScrollLeft.current = scrollerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollerRef.current) return;
    const dx = e.clientX - dragStartX.current;
    scrollerRef.current.scrollLeft = startScrollLeft.current - dx;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  // Touch uses native inertial scrolling; no JS needed
  const handleTouchStart = (_e: React.TouchEvent) => {};
  const handleTouchMove = (_e: React.TouchEvent) => {};
  const handleTouchEnd = (_e?: React.TouchEvent) => {};

  // Map vertical wheel to horizontal scroll on the scroller element
  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta === 0) return;
    e.preventDefault();
    el.scrollLeft += delta;
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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


