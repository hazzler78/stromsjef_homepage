"use client";

import React, { useRef, useState, useEffect } from 'react';
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
  
  &:active {
    cursor: grabbing;
  }
`;

const scroll = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
`;

const Track = styled.div<{ 
  $duration: number; 
  $reverse?: boolean; 
  $isPaused?: boolean;
  $isDragging?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 200%;
  animation: ${scroll} linear infinite;
  animation-duration: ${(p) => p.$duration}s;
  animation-direction: ${(p) => (p.$reverse ? 'reverse' : 'normal')};
  animation-play-state: ${(p) => (p.$isPaused || p.$isDragging ? 'paused' : 'running')};
  will-change: transform;
  touch-action: pan-x;
  backface-visibility: hidden;
  perspective: 1000px;
  
  /* Override animation when dragging */
  ${(p) => p.$isDragging && `
    animation: none !important;
    transform: none !important;
  `}
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [reverse, setReverse] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // iPhone-like momentum scroll state
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(0);
  const currentOffset = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const lastMoveX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const momentumAnimation = useRef<number | null>(null);

  // Get current animation position
  const getCurrentPosition = () => {
    if (!trackRef.current) return 0;
    
    const computedStyle = window.getComputedStyle(trackRef.current);
    const transform = computedStyle.transform;
    
    if (transform === 'none') return 0;
    
    const matrix = new DOMMatrix(transform);
    return matrix.m41; // translateX value
  };

  // iPhone-like momentum animation
  const startMomentumAnimation = (startVelocity: number, startPosition: number) => {
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
    }

    let currentVelocity = startVelocity;
    let currentPosition = startPosition;
    const friction = 0.95; // iPhone-like friction
    const minVelocity = 0.1;

    const animate = () => {
      // Apply velocity to position
      currentPosition += currentVelocity;
      
      // Apply friction to velocity
      currentVelocity *= friction;
      
      // Update transform
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentPosition}px, 0, 0)`;
      }
      
      // Continue animation if velocity is significant
      if (Math.abs(currentVelocity) > minVelocity) {
        momentumAnimation.current = requestAnimationFrame(animate);
      } else {
        // Animation finished, resume normal carousel
        if (trackRef.current) {
          trackRef.current.style.transform = '';
          trackRef.current.style.animationPlayState = 'running';
        }
        setIsPaused(false);
        momentumAnimation.current = null;
      }
    };

    momentumAnimation.current = requestAnimationFrame(animate);
  };

  // iPhone-like drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = Date.now();
    velocity.current = 0;
    
    // Get current position when drag starts
    const currentPos = getCurrentPosition();
    dragStartOffset.current = currentPos;
    currentOffset.current = currentPos;
    
    setIsDragging(true);
    setIsPaused(true);
    
    // Cancel any ongoing momentum animation
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
      momentumAnimation.current = null;
    }
    
    // Pause animation and freeze at current position
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused';
      trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
    }
    
    console.log('Mouse down - starting iPhone-like drag at position:', currentPos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const currentX = e.clientX;
    
    // Calculate velocity for momentum
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      velocity.current = deltaX / deltaTime; // pixels per millisecond
    }
    
    // Update position
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform from saved position
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
    
    console.log('Mouse move:', { deltaX, totalOffset, velocity: velocity.current });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    console.log('Mouse up - starting iPhone-like momentum with velocity:', velocity.current);
    setIsDragging(false);
    
    // Start momentum animation with calculated velocity
    const momentumVelocity = velocity.current * 16; // Convert to pixels per frame (60fps)
    startMomentumAnimation(momentumVelocity, currentOffset.current);
    
    // Apply speed multiplier based on velocity
    const speedMultiplier = Math.min(3, 1 + Math.abs(velocity.current) * 10);
    setSpeedMultiplier(speedMultiplier);
    setReverse(velocity.current > 0);
    
    // Reset after delay
    setTimeout(() => {
      setSpeedMultiplier(1);
      setReverse(false);
    }, 3000);
  };

  // Touch handlers for mobile (iPhone-like)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    dragStartX.current = touch.clientX;
    lastMoveX.current = touch.clientX;
    lastMoveTime.current = Date.now();
    velocity.current = 0;
    
    // Get current position when drag starts
    const currentPos = getCurrentPosition();
    dragStartOffset.current = currentPos;
    currentOffset.current = currentPos;
    
    setIsDragging(true);
    setIsPaused(true);
    
    // Cancel any ongoing momentum animation
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
      momentumAnimation.current = null;
    }
    
    // Pause animation and freeze at current position
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused';
      trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
    }
    
    console.log('Touch start - starting iPhone-like drag at position:', currentPos);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const currentTime = Date.now();
    const currentX = touch.clientX;
    
    // Calculate velocity for momentum
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      velocity.current = deltaX / deltaTime; // pixels per millisecond
    }
    
    // Update position
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform from saved position
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
    
    console.log('Touch move:', { deltaX, totalOffset, velocity: velocity.current });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    console.log('Touch end - starting iPhone-like momentum with velocity:', velocity.current);
    setIsDragging(false);
    
    // Start momentum animation with calculated velocity
    const momentumVelocity = velocity.current * 16; // Convert to pixels per frame (60fps)
    startMomentumAnimation(momentumVelocity, currentOffset.current);
    
    // Apply speed multiplier based on velocity
    const speedMultiplier = Math.min(3, 1 + Math.abs(velocity.current) * 10);
    setSpeedMultiplier(speedMultiplier);
    setReverse(velocity.current > 0);
    
    // Reset after delay
    setTimeout(() => {
      setSpeedMultiplier(1);
      setReverse(false);
    }, 3000);
  };

  // Wheel handler for additional control
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 || e.deltaX > 0 ? false : true;
    setReverse(!direction);
    const delta = Math.min(4, Math.max(1.5, speedMultiplier + Math.abs(e.deltaY || e.deltaX) / 200));
    setSpeedMultiplier(delta);
    
    setTimeout(() => {
      setSpeedMultiplier(1);
      setReverse(false);
    }, 2000);
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <Track 
            ref={trackRef}
            $duration={durationSeconds / speedMultiplier} 
            $reverse={reverse} 
            $isPaused={isPaused}
            $isDragging={isDragging}
          >
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


