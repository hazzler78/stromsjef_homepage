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
  const dragStartY = useRef<number>(0);
  const dragStartOffset = useRef<number>(0);
  const currentOffset = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const lastMoveX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const momentumAnimation = useRef<number | null>(null);
  
  // Enhanced physical properties for bicycle wheel effect
  const angularVelocity = useRef<number>(0); // Like spinning speed
  const angularPosition = useRef<number>(0); // Current rotation position
  const gravity = useRef<number>(0.985); // Gravity effect (like air resistance) - slightly more realistic
  const friction = useRef<number>(0.96); // Friction coefficient - slightly more realistic
  const isSpinning = useRef<boolean>(false);
  
  // Manual animation tracking
  const animationStartTime = useRef<number>(Date.now());
  const isAnimationRunning = useRef<boolean>(true);

  // Simple and reliable position tracking
  const getCurrentPosition = () => {
    if (!trackRef.current) return 0;
    
    const computedStyle = window.getComputedStyle(trackRef.current);
    const transform = computedStyle.transform;
    
    // If there's a transform, use it directly (most reliable)
    if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      const matrix = new DOMMatrix(transform);
      return matrix.m41; // translateX value
    }
    
    // If no transform, we're at position 0
    return 0;
  };

  // Enhanced physical momentum animation - like spinning a bicycle wheel
  const startPhysicalMomentum = (initialVelocity: number, startPosition: number) => {
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
    }

    // Set initial physical properties with better physics
    angularVelocity.current = initialVelocity * 0.8; // Slightly dampen initial velocity for realism
    angularPosition.current = startPosition;
    isSpinning.current = true;

    const animate = () => {
      // Apply enhanced physics: gravity and friction with better curves
      angularVelocity.current *= gravity.current; // Gravity effect (like air resistance)
      angularVelocity.current *= friction.current; // Friction effect
      
      // Add slight deceleration curve for more natural feel
      const decelerationFactor = Math.max(0.92, 1 - (Math.abs(angularVelocity.current) * 0.001));
      angularVelocity.current *= decelerationFactor;
      
      // Update position based on angular velocity
      angularPosition.current += angularVelocity.current;
      
      // Update transform with smooth hardware acceleration
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${angularPosition.current}px, 0, 0)`;
        trackRef.current.style.willChange = 'transform';
      }
      
      // Continue if still spinning (like a bicycle wheel)
      if (Math.abs(angularVelocity.current) > 0.05) {
        momentumAnimation.current = requestAnimationFrame(animate);
      } else {
        // Wheel stopped, resume normal carousel smoothly
        if (trackRef.current) {
          const trackWidth = trackRef.current.offsetWidth;
          const maxOffset = -trackWidth / 2;
          
          // Calculate where we are in the animation cycle
          const currentProgress = Math.abs(angularPosition.current) / Math.abs(maxOffset);
          const normalizedProgress = currentProgress % 1; // Keep within 0-1 range
          
          // Resume animation from this position
          trackRef.current.style.transform = '';
          trackRef.current.style.willChange = 'auto';
          trackRef.current.style.animation = '';
          trackRef.current.style.animationPlayState = 'running';
          
          // Calculate delay to resume from current position
          const animationDuration = (durationSeconds / speedMultiplier) * 1000;
          const delay = normalizedProgress * animationDuration;
          trackRef.current.style.animationDelay = `-${delay}ms`;
          
          // Update animation start time for consistency
          animationStartTime.current = Date.now() - delay;
        }
        
        isSpinning.current = false;
        isAnimationRunning.current = true;
        setIsPaused(false);
        momentumAnimation.current = null;
        
        console.log('🚴 Bicycle wheel stopped, resuming from position:', angularPosition.current);
      }
    };

    console.log('🚴 Starting bicycle wheel spin with velocity:', initialVelocity, 'from position:', startPosition);
    momentumAnimation.current = requestAnimationFrame(animate);
  };

  // Enhanced iPhone-like drag handlers - only start dragging on actual movement
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default or start dragging immediately
    // Just store the initial position for potential drag
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = Date.now();
    velocity.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only start dragging if mouse is actually moving (not just clicking)
    const moveDeltaX = e.clientX - dragStartX.current;
    const moveDeltaY = e.clientY - dragStartY.current;
    
    // Start dragging only if there's significant movement (threshold to avoid accidental drags)
    if (!isDragging && (Math.abs(moveDeltaX) > 5 || Math.abs(moveDeltaY) > 5)) {
      // Now start the actual drag
      e.preventDefault();
      const currentPos = getCurrentPosition();
      dragStartOffset.current = currentPos;
      currentOffset.current = currentPos;
      
      console.log('🖱️ Starting drag from position:', currentPos);
      
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
        trackRef.current.style.animation = 'none';
        trackRef.current.style.animationPlayState = 'paused';
        trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
        trackRef.current.style.willChange = 'transform';
        trackRef.current.style.transition = 'none';
      }
    }
    
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const currentX = e.clientX;
    
    // Calculate velocity for momentum with enhanced smoothing
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      // Enhanced velocity calculation with better responsiveness
      const instantVelocity = deltaX / deltaTime;
      velocity.current = velocity.current * 0.6 + instantVelocity * 0.4; // More responsive smoothing
    }
    
    // Update position with smooth tracking
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform with hardware acceleration
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
      trackRef.current.style.animation = 'none'; // Ensure animation is off
      trackRef.current.style.animationPlayState = 'paused'; // Ensure paused
      trackRef.current.style.transition = 'none'; // Keep transitions disabled
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    console.log('📱 Mouse up - starting bicycle wheel spin with velocity:', velocity.current);
    setIsDragging(false);
    
    // Re-enable transitions for smooth resume
    if (trackRef.current) {
      trackRef.current.style.transition = '';
    }
    
    // If there's significant velocity, start physical momentum (like spinning a bicycle wheel)
    if (Math.abs(velocity.current) > 0.03) {
      const physicalVelocity = velocity.current * 25; // Convert to physical velocity with better scaling
      startPhysicalMomentum(physicalVelocity, currentOffset.current);
      
      // Apply speed multiplier based on velocity (like giving more spin)
      const speedMultiplier = Math.min(3.5, 1 + Math.abs(velocity.current) * 12);
      setSpeedMultiplier(speedMultiplier);
      setReverse(velocity.current > 0);
      
      // Reset after delay
      setTimeout(() => {
        setSpeedMultiplier(1);
        setReverse(false);
      }, 3000);
    } else {
      // No significant velocity, resume normal animation from current position
      if (trackRef.current) {
        const currentPos = currentOffset.current;
        const trackWidth = trackRef.current.offsetWidth;
        const maxOffset = -trackWidth / 2;
        
        // Calculate progress within the animation cycle
        const progress = Math.abs(currentPos) / Math.abs(maxOffset);
        const normalizedProgress = progress % 1; // Keep within 0-1 range
        
        const animationDuration = (durationSeconds / speedMultiplier) * 1000;
        const delay = normalizedProgress * animationDuration;
        
        console.log('📱 Resuming animation from position:', currentPos, 'with delay:', delay);
        
        // Resume animation with calculated delay
        trackRef.current.style.transform = '';
        trackRef.current.style.animation = '';
        trackRef.current.style.animationPlayState = 'running';
        trackRef.current.style.animationDelay = `-${delay}ms`;
        trackRef.current.style.willChange = 'auto';
        
        // Update manual tracking
        isAnimationRunning.current = true;
        animationStartTime.current = Date.now() - delay;
      }
      setIsPaused(false);
    }
  };

  // Enhanced touch handlers for mobile (iPhone-like) - only start dragging on actual movement
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default or start dragging immediately
    // Just store the initial position for potential drag
    const touch = e.touches[0];
    dragStartX.current = touch.clientX;
    dragStartY.current = touch.clientY;
    lastMoveX.current = touch.clientX;
    lastMoveTime.current = Date.now();
    velocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const touchDeltaX = touch.clientX - dragStartX.current;
    const touchDeltaY = touch.clientY - dragStartY.current;
    
    // Start dragging only if there's significant movement (threshold to avoid accidental drags)
    if (!isDragging && (Math.abs(touchDeltaX) > 5 || Math.abs(touchDeltaY) > 5)) {
      // Now start the actual drag
      e.preventDefault();
      const currentPos = getCurrentPosition();
      dragStartOffset.current = currentPos;
      currentOffset.current = currentPos;
      
      console.log('📱 Starting touch drag from position:', currentPos);
      
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
        trackRef.current.style.animation = 'none';
        trackRef.current.style.animationPlayState = 'paused';
        trackRef.current.style.transform = `translate3d(${currentPos}px, 0, 0)`;
        trackRef.current.style.willChange = 'transform';
        trackRef.current.style.transition = 'none';
      }
    }
    
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent default touch behavior
    const currentTime = Date.now();
    const currentX = touch.clientX;
    
    // Calculate velocity for momentum with enhanced smoothing
    const deltaTime = currentTime - lastMoveTime.current;
    const deltaX = currentX - lastMoveX.current;
    
    if (deltaTime > 0) {
      // Enhanced velocity calculation with better responsiveness
      const instantVelocity = deltaX / deltaTime;
      velocity.current = velocity.current * 0.6 + instantVelocity * 0.4; // More responsive smoothing
    }
    
    // Update position with smooth tracking
    const totalOffset = dragStartOffset.current + (currentX - dragStartX.current);
    currentOffset.current = totalOffset;
    
    // Apply drag transform with hardware acceleration
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
      trackRef.current.style.animation = 'none'; // Ensure animation is off
      trackRef.current.style.animationPlayState = 'paused'; // Ensure paused
      trackRef.current.style.transition = 'none'; // Keep transitions disabled
    }
    
    // Update tracking variables
    lastMoveX.current = currentX;
    lastMoveTime.current = currentTime;
    
    console.log('📱 Touch move:', { deltaX, totalOffset, velocity: velocity.current });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    console.log('📱 Touch end - starting bicycle wheel spin with velocity:', velocity.current);
    setIsDragging(false);
    
    // Re-enable transitions for smooth resume
    if (trackRef.current) {
      trackRef.current.style.transition = '';
    }
    
    // If there's significant velocity, start physical momentum (like spinning a bicycle wheel)
    if (Math.abs(velocity.current) > 0.03) {
      const physicalVelocity = velocity.current * 25; // Convert to physical velocity with better scaling
      startPhysicalMomentum(physicalVelocity, currentOffset.current);
      
      // Apply speed multiplier based on velocity (like giving more spin)
      const speedMultiplier = Math.min(3.5, 1 + Math.abs(velocity.current) * 12);
      setSpeedMultiplier(speedMultiplier);
      setReverse(velocity.current > 0);
      
      // Reset after delay
      setTimeout(() => {
        setSpeedMultiplier(1);
        setReverse(false);
      }, 3000);
    } else {
      // No significant velocity, resume normal animation from current position
      if (trackRef.current) {
        const currentPos = currentOffset.current;
        const trackWidth = trackRef.current.offsetWidth;
        const maxOffset = -trackWidth / 2;
        
        // Calculate progress within the animation cycle
        const progress = Math.abs(currentPos) / Math.abs(maxOffset);
        const normalizedProgress = progress % 1; // Keep within 0-1 range
        
        const animationDuration = (durationSeconds / speedMultiplier) * 1000;
        const delay = normalizedProgress * animationDuration;
        
        console.log('📱 Resuming animation from position:', currentPos, 'with delay:', delay);
        
        // Resume animation with calculated delay
        trackRef.current.style.transform = '';
        trackRef.current.style.animation = '';
        trackRef.current.style.animationPlayState = 'running';
        trackRef.current.style.animationDelay = `-${delay}ms`;
        trackRef.current.style.willChange = 'auto';
        
        // Update manual tracking
        isAnimationRunning.current = true;
        animationStartTime.current = Date.now() - delay;
      }
    setIsPaused(false);
    }
  };

  // Enhanced wheel handler for additional control
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 || e.deltaX > 0 ? false : true;
    setReverse(!direction);
    const delta = Math.min(3, Math.max(1.5, speedMultiplier + Math.abs(e.deltaY || e.deltaX) / 300));
    setSpeedMultiplier(delta);
    
    setTimeout(() => {
      setSpeedMultiplier(1);
      setReverse(false);
    }, 1500);
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


