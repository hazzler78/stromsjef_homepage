"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { withDefaultCtaUtm } from '@/lib/utm';

const Banner = styled.div<{ $isCollapsed: boolean }>`
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-align: center;
  padding: ${props => props.$isCollapsed ? '0.8rem 0.5rem' : '1.2rem 0.5rem'};
  font-size: ${props => props.$isCollapsed ? '1rem' : '1.15rem'};
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: var(--glass-shadow-light);
  z-index: 2000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.3s ease-in-out;
`;

const Highlight = styled.span`
  color: #BA0C2F;
  background: rgba(186, 12, 47, 0.2);
  padding: 0.1em 0.4em;
  border-radius: 0.4em;
  margin: 0 0.2em;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(186, 12, 47, 0.3);
`;

const StyledLink = styled.a`
  color: #BA0C2F;
  margin: 0 0.2em;
  text-decoration: underline;
  font-weight: 700;
  transition: color 0.2s;
  
  &:hover {
    color: #D91A3D;
  }
`;

const CollapsedText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export default function CampaignBanner() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('banner_variant_v1') : null;
      const storedExpiry = typeof window !== 'undefined' ? window.localStorage.getItem('banner_variant_expiry_v1') : null;
      const now = Date.now();
      const isExpired = storedExpiry ? now > Number(storedExpiry) : true;

      if (stored && (stored === 'A' || stored === 'B') && !isExpired) {
        setVariant(stored);
        return;
      }

      const newVariant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
      const expiry = now + 30 * 24 * 60 * 60 * 1000; // 30 dagar
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('banner_variant_v1', newVariant);
        window.localStorage.setItem('banner_variant_expiry_v1', String(expiry));
      }
      setVariant(newVariant);
    } catch {
      // no-op
    }
  }, []);

  // Auto-collapse after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Impression tracking: 1 per 24h per variant
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = `banner_impression_${variant}`;
      const last = Number(window.localStorage.getItem(key) || '0');
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      if (!last || now - last > dayMs) {
        const sessionId = window.localStorage.getItem('invoice_session_id') || '';
        const payload = JSON.stringify({ variant, sessionId });
        const url = '/api/events/banner-impression';
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
        }
        window.localStorage.setItem(key, String(now));
      }
    } catch {}
  }, [variant]);

  const href = withDefaultCtaUtm('/jamfor-elpriser', 'banner', `variant${variant}`, 'ai-savings');

  const handleClick = () => {
    try {
      const sessionId = (typeof window !== 'undefined') ? (window.localStorage.getItem('invoice_session_id') || '') : '';
      const payload = JSON.stringify({ variant, href, sessionId });
      const url = '/api/events/banner-click';
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
      }
    } catch {}
  };

  // Expanded text variants
  const textA = (
    <>
      Nyhet! La vår <Highlight>AI</Highlight> analysere din strømregning og regne ut din mulige besparelse.
    </>
  );

  const textB = (
    <>
      Test vår <Highlight>AI</Highlight> – last opp din regning og se hvor mye du kan spare.
    </>
  );

  // Collapsed text variants
  const collapsedTextA = (
    <CollapsedText>
      <Image src="/favicon.svg" alt="Strømsjef" width={16} height={16} style={{ verticalAlign: 'middle' }} />
      <Highlight>AI</Highlight>analyse av din strømregning
      <StyledLink href={href} onClick={handleClick}>Prøv nå</StyledLink>
    </CollapsedText>
  );

  const collapsedTextB = (
    <CollapsedText>
      <Image src="/favicon.svg" alt="Strømsjef" width={16} height={16} style={{ verticalAlign: 'middle' }} />
      Last opp regning med <Highlight>AI</Highlight>
      <StyledLink href={href} onClick={handleClick}>Prøv nå</StyledLink>
    </CollapsedText>
  );

  return (
    <Banner $isCollapsed={isCollapsed}>
      {isCollapsed ? (
        variant === 'A' ? collapsedTextA : collapsedTextB
      ) : (
        <>
          <Image src="/favicon.svg" alt="Strømsjef" width={20} height={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {variant === 'A' ? textA : textB}
          <br />
          Last opp din regning og få en tydelig gjennomgang –
          <StyledLink href={href} onClick={handleClick}>Prøv nå</StyledLink>
        </>
      )}
    </Banner>
  );
} 