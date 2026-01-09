"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { createClient } from '@supabase/supabase-js';

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

interface BannerSettings {
  active: boolean;
  variant_a_expanded_text: string;
  variant_b_expanded_text: string;
  variant_a_collapsed_text: string;
  variant_b_collapsed_text: string;
  highlight_text: string;
  link_url: string;
  link_text_expanded: string;
  link_text_collapsed: string;
}

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

export default function CampaignBanner() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<BannerSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch banner settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('banner_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (!error && data) {
          setSettings(data as BannerSettings);
        } else {
          // Fallback to default settings if database fetch fails
          setSettings({
            active: true,
            variant_a_expanded_text: 'Vår beste deal akkurat nå: {highlight} – anbefales sterkt!',
            variant_b_expanded_text: 'Vår beste deal akkurat nå: {highlight} – anbefales sterkt!',
            variant_a_collapsed_text: '{highlight} – anbefales sterkt!',
            variant_b_collapsed_text: '{highlight} – anbefales sterkt!',
            highlight_text: 'Fastpris 99 øre/kWh',
            link_url: 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
            link_text_expanded: 'Se avtale →',
            link_text_collapsed: 'Se avtale',
          });
        }
      } catch {
        // Fallback to default settings on error
        setSettings({
          active: true,
          variant_a_expanded_text: 'Vår beste deal akkurat nå: {highlight} – anbefales sterkt!',
          variant_b_expanded_text: 'Vår beste deal akkurat nå: {highlight} – anbefales sterkt!',
          variant_a_collapsed_text: '{highlight} – anbefales sterkt!',
          variant_b_collapsed_text: '{highlight} – anbefales sterkt!',
          highlight_text: 'Fastpris 99 øre/kWh',
          link_url: 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
          link_text_expanded: 'Se avtale →',
          link_text_collapsed: 'Se avtale',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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

  // Helper function to render text with highlight replacement
  const renderText = (text: string, highlightText: string) => {
    const parts = text.split('{highlight}');
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <Highlight>{highlightText}</Highlight>}
          </React.Fragment>
        ))}
      </>
    );
  };

  const handleClick = () => {
    if (!settings) return;
    try {
      const sessionId = (typeof window !== 'undefined') ? (window.localStorage.getItem('invoice_session_id') || '') : '';
      const payload = JSON.stringify({ variant, href: settings.link_url, sessionId });
      const url = '/api/events/banner-click';
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
      }
    } catch {}
  };

  // Don't render if loading, inactive, or no settings
  if (loading || !settings || !settings.active) {
    return null;
  }

  const href = settings.link_url;

  // Expanded text variants
  const textA = renderText(settings.variant_a_expanded_text, settings.highlight_text);
  const textB = renderText(settings.variant_b_expanded_text, settings.highlight_text);

  // Collapsed text variants
  const collapsedTextA = (
    <CollapsedText>
      <Image src="/favicon.svg" alt="Strømsjef" width={16} height={16} style={{ verticalAlign: 'middle' }} />
      {renderText(settings.variant_a_collapsed_text, settings.highlight_text)}
      <StyledLink href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        {settings.link_text_collapsed}
      </StyledLink>
    </CollapsedText>
  );

  const collapsedTextB = (
    <CollapsedText>
      <Image src="/favicon.svg" alt="Strømsjef" width={16} height={16} style={{ verticalAlign: 'middle' }} />
      {renderText(settings.variant_b_collapsed_text, settings.highlight_text)}
      <StyledLink href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        {settings.link_text_collapsed}
      </StyledLink>
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
          <StyledLink href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer">
            {settings.link_text_expanded}
          </StyledLink>
        </>
      )}
    </Banner>
  );
} 