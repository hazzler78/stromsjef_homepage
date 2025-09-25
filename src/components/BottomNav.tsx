"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { withDefaultCtaUtm } from '@/lib/utm';

const Nav = styled.nav<{ offset?: number }>`
  position: fixed;
  bottom: ${(props) => (props.offset ? `${props.offset}px` : '0')};
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  box-shadow: var(--glass-shadow-light);
  z-index: 1003 !important;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.5rem;
  position: relative;
  transition: color 0.3s ease;
  
  &.active {
    color: var(--primary);
  }
  
  &:hover {
    color: var(--primary);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -0.25rem;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 201, 107, 0.5);
`;

function BottomNavContent() {
  const pathname = usePathname();
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const selectCookieBannerElement = (): HTMLElement | null => {
      // Comprehensive list of cookie banner selectors for different browsers and implementations
      const candidates = [
        // Cookiebot specific
        '#CybotCookiebotDialog',
        '[id^="CybotCookiebot"]',
        '#CookiebotDialog',
        '.CookieConsent',
        '.CookiebotWidget',
        '#CookieConsent',
        '#CookieDeclaration',
        '.cookieconsent',
        '.cookie-declaration',
        
        // Generic cookie-related selectors
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[id*="Cookie"]',
        '[class*="Cookie"]',
        
        // Safari-specific and other common patterns
        '[id*="consent"]',
        '[class*="consent"]',
        '[id*="Consent"]',
        '[class*="Consent"]',
        '[id*="gdpr"]',
        '[class*="gdpr"]',
        '[id*="GDPR"]',
        '[class*="GDPR"]',
        
        // Fixed positioned elements at bottom that might be cookie banners
        '[style*="position: fixed"][style*="bottom"]',
        '[style*="position:fixed"][style*="bottom"]',
        
        // Common cookie banner classes
        '.cookie-banner',
        '.cookie-notice',
        '.privacy-banner',
        '.consent-banner',
        '.gdpr-banner',
        '.cookie-policy',
        '.cookie-widget',
        '.cookie-popup',
        '.cookie-modal',
        '.cookie-overlay',
        
        // More specific patterns
        '[data-testid*="cookie"]',
        '[data-testid*="consent"]',
        '[aria-label*="cookie"]',
        '[aria-label*="consent"]',
        '[title*="cookie"]',
        '[title*="consent"]',
      ];
      
      for (const selector of candidates) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const htmlEl = el as HTMLElement;
            if (htmlEl && isElementVisible(htmlEl)) {
              return htmlEl;
            }
          }
        } catch {
          // Skip invalid selectors
          continue;
        }
      }
      
      // Fallback: look for any fixed positioned element at the bottom
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const htmlEl = el as HTMLElement;
        if (htmlEl && htmlEl.style) {
          const style = window.getComputedStyle(htmlEl);
          const rect = htmlEl.getBoundingClientRect();
          
          // Check if element is fixed positioned and at bottom
          if (style.position === 'fixed' && 
              rect.bottom > window.innerHeight - 50 && 
              rect.height > 20 && 
              isElementVisible(htmlEl)) {
            return htmlEl;
          }
        }
      }
      
      return null;
    };

    const isElementVisible = (el: HTMLElement): boolean => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    };

    const updateOffset = () => {
      try {
        const banner = selectCookieBannerElement();
        if (banner && isElementVisible(banner)) {
          const rect = banner.getBoundingClientRect();
          
          // Check if banner is overlapping with bottom navigation area
          const navHeight = 80; // Approximate height of bottom nav
          const isOverlappingNav = rect.bottom > window.innerHeight - navHeight;
          
          // Debug logging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log('Cookie banner detected:', {
              height: rect.height,
              bottom: rect.bottom,
              windowHeight: window.innerHeight,
              isOverlappingNav,
              element: banner
            });
          }
          
          if (isOverlappingNav) {
            // Move the cookie banner up by adjusting its position
            const newBottom = navHeight + 20; // 20px gap above nav
            
            if (banner.style.position === 'fixed' || banner.style.position === '') {
              banner.style.position = 'fixed';
              banner.style.bottom = `${newBottom}px`;
              banner.style.zIndex = '1002'; // Below our nav (1003)
            }
            
            // No offset needed for nav since we moved the banner
            setBottomOffset(0);
          } else {
            setBottomOffset(0);
          }
        } else {
          setBottomOffset(0);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating bottom nav offset:', error);
        }
        setBottomOffset(0);
      }
    };

    // Initial check
    updateOffset();

    // Recalculate on resize and orientation changes
    const handleResize: EventListener = () => updateOffset();
    const handleOrientationChange: EventListener = () => updateOffset();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Observe DOM mutations to detect when Cookiebot injects/hides the banner
    const observer = new MutationObserver(() => updateOffset());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // More frequent polling for Safari and mobile devices
    const pollInterval = window.innerWidth <= 768 ? 500 : 1000;
    const interval = window.setInterval(updateOffset, pollInterval);
    
    // Immediate check after a short delay for Safari
    const immediateCheck = window.setTimeout(updateOffset, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      observer.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(immediateCheck);
    };
  }, []);
  
  return (
    <Nav offset={bottomOffset}>
      <NavItem href={withDefaultCtaUtm('/', 'bottomnav', 'home')} className={pathname === '/' ? 'active' : ''}>
        Hem
        {pathname === '/' && <ActiveIndicator />}
      </NavItem>
      <NavItem href={withDefaultCtaUtm('/jamfor-elpriser', 'bottomnav', 'compare')} className={pathname === '/jamfor-elpriser' ? 'active' : ''}>
        Jämför
        {pathname === '/jamfor-elpriser' && <ActiveIndicator />}
      </NavItem>
      <NavItem href={withDefaultCtaUtm('/media', 'bottomnav', 'media')} className={pathname === '/media' ? 'active' : ''}>
        Media
        {pathname === '/media' && <ActiveIndicator />}
      </NavItem>
      <NavItem href={withDefaultCtaUtm('/foretag', 'bottomnav', 'b2b')} className={pathname === '/foretag' ? 'active' : ''}>
        Företag
        {pathname === '/foretag' && <ActiveIndicator />}
      </NavItem>
      <NavItem href={withDefaultCtaUtm('/om-oss', 'bottomnav', 'about')} className={pathname === '/om-oss' ? 'active' : ''}>
        Om oss
        {pathname === '/om-oss' && <ActiveIndicator />}
      </NavItem>
    </Nav>
  );
}

export default function BottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <BottomNavContent />;
} 