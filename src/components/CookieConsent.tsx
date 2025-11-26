"use client";

import { useState, useEffect } from 'react';
import styled from 'styled-components';

const CookieBanner = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  z-index: 1002;
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 0.3s ease-in-out;
  
  /* Identifier for navigation components */
  &[data-cookie-banner="true"] {
    /* This attribute helps other components detect the banner */
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  }
`;

const CookieContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const CookieText = styled.div`
  flex: 1;
  min-width: 250px;
  
  p {
    margin: 0;
    color: #374151;
    font-size: 0.9rem;
    line-height: 1.5;
    
    a {
      color: var(--primary);
      text-decoration: underline;
      
      &:hover {
        text-decoration: none;
      }
    }
  }
`;

const CookieButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--primary);
    color: white;
    
    &:hover {
      background: #00b875;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 201, 107, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `}
  
  @media (max-width: 600px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`;

const SettingsButton = styled.button`
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1004;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
  
  svg {
    width: 24px;
    height: 24px;
    fill: var(--primary);
  }
  
  @media (max-width: 600px) {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
    width: 44px;
    height: 44px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const SettingsModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1003;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  @media (max-width: 600px) {
    align-items: flex-end;
  }
`;

const SettingsContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 600px) {
    border-radius: 1rem 1rem 0 0;
    max-height: 90vh;
    padding: 1.5rem;
  }
`;

const SettingsTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: var(--primary);
  font-size: 1.5rem;
`;

const SettingsDescription = styled.p`
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const CookieCategory = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CategoryTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #111827;
`;

const CategoryDescription = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.5;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
      background-color: var(--primary);
      
      &:before {
        transform: translateX(24px);
      }
    }
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (consent === 'accepted' && savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences);
        setPreferences(prefs);
        applyCookiePreferences(prefs);
      } catch {
        // Invalid preferences, show banner again
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, []);

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Necessary cookies are always enabled
    // Analytics cookies (Google Analytics, etc.)
    if (prefs.analytics) {
      // Enable analytics tracking
      // This is where you would initialize Google Analytics, etc.
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as typeof window & { dataLayer?: unknown[] };
        win.dataLayer = win.dataLayer || [];
        // Add your analytics initialization here if needed
        // Example: gtag('config', 'GA_MEASUREMENT_ID');
      }
    } else {
      // Disable analytics
      // Block analytics scripts if needed
    }

    // Marketing cookies
    if (prefs.marketing) {
      // Enable marketing tracking
    } else {
      // Disable marketing
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    applyCookiePreferences(allAccepted);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem(COOKIE_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(necessaryOnly));
    applyCookiePreferences(necessaryOnly);
    setIsVisible(false);
    setShowSettings(false);
  };

  const savePreferences = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    applyCookiePreferences(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible && !showSettings) {
    return (
      <SettingsButton onClick={() => setShowSettings(true)} aria-label="Cookie-inställningar">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9zm3.5-8.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S12 6.17 12 7s.67 1.5 1.5 1.5zm-7 7c.83 0 1.5-.67 1.5-1.5S9.33 12.5 8.5 12.5 7 13.17 7 14s.67 1.5 1.5 1.5zm7-7c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S12 6.17 12 7s.67 1.5 1.5 1.5zm-7 7c.83 0 1.5-.67 1.5-1.5S9.33 12.5 8.5 12.5 7 13.17 7 14s.67 1.5 1.5 1.5zm7-7c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S12 6.17 12 7s.67 1.5 1.5 1.5z" fill="currentColor"/>
        </svg>
      </SettingsButton>
    );
  }

  return (
    <>
      <CookieBanner $isVisible={isVisible} data-cookie-banner="true">
        <CookieContent>
          <CookieText>
            <p>
              Vi bruker cookies for å forbedre opplevelsen din på Strømsjef.no. 
              Nødvendige cookies er alltid aktive, men du kan velge å aktivere 
              analyse- og markedsføringscookies. Les mer i vår{' '}
              <a href="/cookies">cookiepolicy</a>.
            </p>
          </CookieText>
          <CookieButtons>
            <Button $variant="secondary" onClick={() => {
              setIsVisible(false);
              setShowSettings(true);
            }}>
              Innstillinger
            </Button>
            <Button $variant="secondary" onClick={acceptNecessary}>
              Kun nødvendige
            </Button>
            <Button $variant="primary" onClick={acceptAll}>
              Godta alle
            </Button>
          </CookieButtons>
        </CookieContent>
      </CookieBanner>

      <SettingsModal $isOpen={showSettings} onClick={() => setShowSettings(false)}>
        <SettingsContent onClick={(e) => e.stopPropagation()}>
          <SettingsTitle>Cookie-inställningar</SettingsTitle>
          <SettingsDescription>
            Du kan velge hvilke typer cookies du vil tillate. Nødvendige cookies 
            er alltid aktive for at nettstedet skal fungere.
          </SettingsDescription>

          <CookieCategory>
            <CategoryHeader>
              <div>
                <CategoryTitle>Nødvendige cookies</CategoryTitle>
                <CategoryDescription>
                  Disse cookies er nødvendige for at nettstedet skal fungere. 
                  De kan ikke deaktiveres.
                </CategoryDescription>
              </div>
              <Toggle>
                <input type="checkbox" checked={true} disabled />
                <span />
              </Toggle>
            </CategoryHeader>
          </CookieCategory>

          <CookieCategory>
            <CategoryHeader>
              <div>
                <CategoryTitle>Analyse-cookies</CategoryTitle>
                <CategoryDescription>
                  Hjelper oss å forstå hvordan besøkende bruker nettstedet, 
                  slik at vi kan forbedre funksjonalitet og innhold.
                </CategoryDescription>
              </div>
              <Toggle>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                />
                <span />
              </Toggle>
            </CategoryHeader>
          </CookieCategory>

          <CookieCategory>
            <CategoryHeader>
              <div>
                <CategoryTitle>Markedsføringscookies</CategoryTitle>
                <CategoryDescription>
                  Brukes for å vise relevante tilbud og annonser. 
                  Vi bruker per i dag ingen tredjepartsannonsering.
                </CategoryDescription>
              </div>
              <Toggle>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                />
                <span />
              </Toggle>
            </CategoryHeader>
          </CookieCategory>

          <ModalButtons>
            <Button $variant="secondary" onClick={() => {
              setShowSettings(false);
              if (!localStorage.getItem(COOKIE_KEY)) {
                setIsVisible(true);
              }
            }} style={{ flex: 1 }}>
              Avbryt
            </Button>
            <Button $variant="primary" onClick={savePreferences} style={{ flex: 1 }}>
              Lagre preferanser
            </Button>
          </ModalButtons>
        </SettingsContent>
      </SettingsModal>
    </>
  );
}

