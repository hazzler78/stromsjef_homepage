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
  touch-action: none; /* Disable default touch behaviors */
  
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
  
  // Physical momentum state - like spinning a bicycle wheel
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(0);
  const currentOffset = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const lastMoveX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const momentumAnimation = useRef<number | null>(null);
  
  // Physical properties for bicycle wheel effect
  const angularVelocity = useRef<number>(0); // Like spinning speed
  const angularPosition = useRef<number>(0); // Current rotation position
  const gravity = useRef<number>(0.98); // Gravity effect (like air resistance)
  const friction = useRef<number>(0.95); // Friction coefficient
  const isSpinning = useRef<boolean>(false);
  
  // Manual animation tracking
  const animationStartTime = useRef<number>(Date.now());
  const isAnimationRunning = useRef<boolean>(true);

  // Get current animation position - manual tracking approach
  const getCurrentPosition = () => {
    if (!trackRef.current) return 0;
    
    const computedStyle = window.getComputedStyle(trackRef.current);
    const transform = computedStyle.transform;
    
    // If there's a transform, use it directly
    if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      const matrix = new DOMMatrix(transform);
      return matrix.m41; // translateX value
    }
    
    // If no transform, calculate based on manual tracking
    if (isAnimationRunning.current && trackRef.current) {
      const now = Date.now();
      const elapsed = (now - animationStartTime.current) % (durationSeconds * 1000 * 2); // Loop every 2 cycles
      const progress = elapsed / (durationSeconds * 1000);
      
      // Calculate position based on animation progress
      const trackWidth = trackRef.current.offsetWidth;
      const maxOffset = -trackWidth / 2; // -50% of width
      const position = maxOffset * progress;
      
      console.log('Manual position calculation:', {
        elapsed,
        progress,
        trackWidth,
        maxOffset,
        position,
        isAnimationRunning: isAnimationRunning.current
      });
      
      return position;
    }
    
    return 0;
  };

  // Physical momentum animation - like spinning a bicycle wheel
  const startPhysicalMomentum = (initialVelocity: number, startPosition: number) => {
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
    }

    // Set initial physical properties
    angularVelocity.current = initialVelocity;
    angularPosition.current = startPosition;
    isSpinning.current = true;

    const animate = () => {
      // Apply physics: gravity and friction
      angularVelocity.current *= gravity.current; // Gravity effect (like air resistance)
      angularVelocity.current *= friction.current; // Friction effect
      
      // Update position based on angular velocity
      angularPosition.current += angularVelocity.current;
      
      // Update transform
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${angularPosition.current}px, 0, 0)`;
      }
      
      // Continue if still spinning (like a bicycle wheel)
      if (Math.abs(angularVelocity.current) > 0.1) {
        momentumAnimation.current = requestAnimationFrame(animate);
      } else {
        // Wheel stopped, resume normal carousel
        if (trackRef.current) {
          const trackWidth = trackRef.current.offsetWidth;
          const maxOffset = -trackWidth / 2;
          const progress = Math.abs(angularPosition.current) / Math.abs(maxOffset);
          const animationDuration = (durationSeconds / speedMultiplier) * 1000;
          const delay = progress * animationDuration;
          
          // Resume animation with calculated delay
          trackRef.current.style.transform = '';
          trackRef.current.style.animation = '';
          trackRef.current.style.animationPlayState = 'running';
          trackRef.current.style.animationDelay = `-${delay}ms`;
        }
        isSpinning.current = false;
        setIsPaused(false);
        momentumAnimation.current = null;
        console.log('Bicycle wheel stopped, resuming from position:', angularPosition.current);
      }
    };

    console.log('Starting bicycle wheel spin with velocity:', initialVelocity, 'from position:', startPosition);
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
    
    console.log('Mouse down - current position:', currentPos);
    console.log('Animation state before pause:', {
      animation: trackRef.current?.style.animation,
      transform: trackRef.current?.style.transform,
      computedTransform: trackRef.current ? window.getComputedStyle(trackRef.current).transform : 'none',
      isSpinning: isSpinning.current,
      angularVelocity: angularVelocity.current,
      isAnimationRunning: isAnimationRunning.current,
      animationStartTime: animationStartTime.current
    });
    
    setIsDragging(true);
    setIsPaused(true);
    isSpinning.current = false;
    isAnimationRunning.current = false;
    
    // Cancel any ongoing momentum animation
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
      momentumAnimation.current = null;
    }
    
    // Pause animation and freeze at current position
    if (trackRef.current) {
      // Disable animation completely and set position
      trackRef.current.style.animation = 'none';
      trackRef.current.style.animationPlayState = 'paused';
      trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
    }
    
    console.log('Animation state after pause:', {
      animation: trackRef.current?.style.animation,
      transform: trackRef.current?.style.transform
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const currentX = e.clientX;
    
    // Calculate velocity for momentum with better smoothing
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      // Smooth velocity calculation with better responsiveness
      const instantVelocity = deltaX / deltaTime;
      velocity.current = velocity.current * 0.7 + instantVelocity * 0.3; // Smoothing
    }
    
    // Update position
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform from saved position - make sure it's visible
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
      trackRef.current.style.animation = 'none'; // Ensure animation is off
      trackRef.current.style.animationPlayState = 'paused'; // Ensure paused
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
    
    console.log('Mouse move:', { deltaX, totalOffset, velocity: velocity.current });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    console.log('Mouse up - starting bicycle wheel spin with velocity:', velocity.current);
    setIsDragging(false);
    
    // If there's significant velocity, start physical momentum (like spinning a bicycle wheel)
    if (Math.abs(velocity.current) > 0.05) {
      const physicalVelocity = velocity.current * 20; // Convert to physical velocity
      startPhysicalMomentum(physicalVelocity, currentOffset.current);
      
      // Apply speed multiplier based on velocity (like giving more spin)
      const speedMultiplier = Math.min(4, 1 + Math.abs(velocity.current) * 15);
      setSpeedMultiplier(speedMultiplier);
      setReverse(velocity.current > 0);
      
      // Reset after delay
      setTimeout(() => {
        setSpeedMultiplier(1);
        setReverse(false);
      }, 4000);
    } else {
      // No significant velocity, resume normal animation from current position
      if (trackRef.current) {
        // Calculate animation delay to resume from current position
        const currentPos = currentOffset.current;
        const trackWidth = trackRef.current.offsetWidth;
        const maxOffset = -trackWidth / 2;
        const progress = Math.abs(currentPos) / Math.abs(maxOffset);
        const animationDuration = (durationSeconds / speedMultiplier) * 1000;
        const delay = progress * animationDuration;
        
        console.log('Resuming animation from position:', currentPos, 'with delay:', delay);
        
        // Resume animation with calculated delay
        trackRef.current.style.animation = '';
        trackRef.current.style.animationPlayState = 'running';
        trackRef.current.style.animationDelay = `-${delay}ms`;
        trackRef.current.style.transform = '';
        
        // Update manual tracking
        isAnimationRunning.current = true;
        animationStartTime.current = Date.now() - delay;
      }
      setIsPaused(false);
    }
  };

  // Touch handlers for mobile (iPhone-like)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartX.current = touch.clientX;
    lastMoveX.current = touch.clientX;
    lastMoveTime.current = Date.now();
    velocity.current = 0;
    
    // Get current position when drag starts
    const currentPos = getCurrentPosition();
    dragStartOffset.current = currentPos;
    currentOffset.current = currentPos;
    
    console.log('Touch start - current position:', currentPos);
    console.log('Animation state before pause:', {
      animation: trackRef.current?.style.animation,
      transform: trackRef.current?.style.transform,
      computedTransform: trackRef.current ? window.getComputedStyle(trackRef.current).transform : 'none',
      isSpinning: isSpinning.current,
      angularVelocity: angularVelocity.current,
      isAnimationRunning: isAnimationRunning.current,
      animationStartTime: animationStartTime.current
    });
    
    setIsDragging(true);
    setIsPaused(true);
    isSpinning.current = false;
    isAnimationRunning.current = false;
    
    // Cancel any ongoing momentum animation
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
      momentumAnimation.current = null;
    }
    
    // Pause animation and freeze at current position
    if (trackRef.current) {
      // Disable animation completely and set position
      trackRef.current.style.animation = 'none';
      trackRef.current.style.animationPlayState = 'paused';
      trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
    }
    
    console.log('Animation state after pause:', {
      animation: trackRef.current?.style.animation,
      transform: trackRef.current?.style.transform
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    const currentX = touch.clientX;
    
    // Calculate velocity for momentum with better smoothing
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      // Smooth velocity calculation with better responsiveness
      const instantVelocity = deltaX / deltaTime;
      velocity.current = velocity.current * 0.7 + instantVelocity * 0.3; // Smoothing
    }
    
    // Update position
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform from saved position - make sure it's visible
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
      trackRef.current.style.animation = 'none'; // Ensure animation is off
      trackRef.current.style.animationPlayState = 'paused'; // Ensure paused
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
    
    console.log('Touch move:', { deltaX, totalOffset, velocity: velocity.current });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    console.log('Touch end - starting bicycle wheel spin with velocity:', velocity.current);
    setIsDragging(false);
    
    // If there's significant velocity, start physical momentum (like spinning a bicycle wheel)
    if (Math.abs(velocity.current) > 0.05) {
      const physicalVelocity = velocity.current * 20; // Convert to physical velocity
      startPhysicalMomentum(physicalVelocity, currentOffset.current);
      
      // Apply speed multiplier based on velocity (like giving more spin)
      const speedMultiplier = Math.min(4, 1 + Math.abs(velocity.current) * 15);
      setSpeedMultiplier(speedMultiplier);
      setReverse(velocity.current > 0);
      
      // Reset after delay
      setTimeout(() => {
        setSpeedMultiplier(1);
        setReverse(false);
      }, 4000);
    } else {
      // No significant velocity, resume normal animation from current position
      if (trackRef.current) {
        // Calculate animation delay to resume from current position
        const currentPos = currentOffset.current;
        const trackWidth = trackRef.current.offsetWidth;
        const maxOffset = -trackWidth / 2;
        const progress = Math.abs(currentPos) / Math.abs(maxOffset);
        const animationDuration = (durationSeconds / speedMultiplier) * 1000;
        const delay = progress * animationDuration;
        
        console.log('Resuming animation from position:', currentPos, 'with delay:', delay);
        
        // Resume animation with calculated delay
        trackRef.current.style.animation = '';
        trackRef.current.style.animationPlayState = 'running';
        trackRef.current.style.animationDelay = `-${delay}ms`;
        trackRef.current.style.transform = '';
        
        // Update manual tracking
        isAnimationRunning.current = true;
        animationStartTime.current = Date.now() - delay;
      }
    setIsPaused(false);
    }
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


