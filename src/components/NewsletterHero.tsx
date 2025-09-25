"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

const NewsletterHeroSection = styled.section`
  padding: 4rem 1rem;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow-light);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: rgba(255,255,255,0.9);
  color: var(--foreground);
  transition: all 0.2s;
  box-shadow: none;
  &::placeholder {
    color: var(--gray-600);
    opacity: 1;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 106, 167, 0.15);
    color: var(--foreground);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--glass-shadow-light);
  white-space: nowrap;
  &:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--glass-shadow-medium);
  }
  &:active {
    transform: translateY(0) scale(0.98);
  }
  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  justify-content: flex-start;
  text-align: left;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  accent-color: var(--secondary);
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: var(--gray-700);
  opacity: 1;
  line-height: 1.5;
  cursor: pointer;
  text-align: left;
  word-break: break-word;
`;

const ErrorMessage = styled.div`
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 600;
`;

const SuccessMessage = styled.div`
  color: var(--secondary);
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(16, 185, 129, 0.3);
`;

const NewsletterBenefits = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: left;
`;

const BenefitsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.4;
  
  &:before {
    content: "✓";
    color: var(--secondary);
    font-weight: bold;
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

const Benefits = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
`;

const Benefit = styled.div`
  text-align: center;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

// SVG Ikoner i glassmorphism-stil
const RocketIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 8, filter: 'drop-shadow(0 2px 8px rgba(0,106,167,0.18))' }}>
    <ellipse cx="16" cy="28" rx="8" ry="2.5" fill="rgba(0,106,167,0.18)" />
    <path d="M16 4c3.5 0 7 3.5 7 7 0 4.5-4.5 10-7 13.5C13.5 21 9 15.5 9 11c0-3.5 3.5-7 7-7z" fill="url(#rocket-gradient)" stroke="rgba(0,106,167,0.7)" strokeWidth="1.5" />
    <circle cx="16" cy="11" r="2.5" fill="#fff" stroke="rgba(0,106,167,0.7)" strokeWidth="1.2" />
    <defs>
      <linearGradient id="rocket-gradient" x1="9" y1="4" x2="23" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#006aa7" />
        <stop offset="1" stopColor="#fecc00" />
      </linearGradient>
    </defs>
  </svg>
);
const ChartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 8, filter: 'drop-shadow(0 2px 8px rgba(0,106,167,0.18))' }}>
    <ellipse cx="16" cy="28" rx="8" ry="2.5" fill="rgba(0,106,167,0.13)" />
    <rect x="10" y="14" width="3" height="7" rx="1.5" fill="#006aa7" />
    <rect x="15" y="10" width="3" height="11" rx="1.5" fill="#fecc00" />
    <rect x="20" y="17" width="3" height="4" rx="1.5" fill="#006aa7" />
  </svg>
);
const PiggyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 8, filter: 'drop-shadow(0 2px 8px rgba(0,106,167,0.15))' }}>
    <ellipse cx="16" cy="28" rx="8" ry="2.5" fill="rgba(0,106,167,0.13)" />
    <ellipse cx="16" cy="16" rx="8" ry="6" fill="url(#piggy-gradient)" stroke="#006aa7" strokeWidth="1.2" />
    <circle cx="13" cy="15" r="1" fill="#fff" />
    <rect x="19" y="19" width="2.5" height="4" rx="1.2" fill="#fecc00" />
    <defs>
      <linearGradient id="piggy-gradient" x1="8" y1="10" x2="24" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#006aa7" />
        <stop offset="1" stopColor="#fecc00" />
      </linearGradient>
    </defs>
  </svg>
);

export default function NewsletterHero() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ref, setRef] = useState<string | null>(null);
  const [campaignCode, setCampaignCode] = useState<string | null>(null);

  React.useEffect(() => {
    const refMatch = document.cookie.match(/(?:^|; )elchef_affiliate=([^;]+)/);
    const campMatch = document.cookie.match(/(?:^|; )elchef_campaign=([^;]+)/);
    if (refMatch) setRef(decodeURIComponent(refMatch[1]));
    if (campMatch) setCampaignCode(decodeURIComponent(campMatch[1]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Ange din e-postadress');
      return;
    }
    
    if (!consent) {
      setError('Du måste godkänna att få nyhetsbrev');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, ref, campaignCode }),
      });
      
      if (response.ok) {
        setSuccess('Tack! Du är nu anmäld till vårt nyhetsbrev. Vi skickar dig snart de bästa elpriserna!');
        setEmail('');
        setConsent(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Ett fel uppstod. Försök igen senare.');
      }
    } catch {
      setError('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NewsletterHeroSection>
      <Container>
        <Title>Få de bästa elpriserna först</Title>
        <Subtitle>
          Registrera dig för vårt nyhetsbrev och få exklusiva erbjudanden, 
          elprisuppdateringar och tips för att spara pengar på din elräkning.
        </Subtitle>
        
        <NewsletterForm onSubmit={handleSubmit}>
          <InputGroup>
            <EmailInput
              type="email"
              placeholder="Din e-postadress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Anmäler...' : 'Anmäl dig gratis'}
            </SubmitButton>
          </InputGroup>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="newsletter-hero-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isSubmitting}
            />
            <CheckboxLabel htmlFor="newsletter-hero-consent">
              Jag godkänner att få nyhetsbrev från Elchef med erbjudanden och uppdateringar om elpriser. 
              Du kan när som helst avprenumerera genom att klicka på länken i mailet.
            </CheckboxLabel>
          </CheckboxGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </NewsletterForm>

        <NewsletterBenefits>
          <BenefitsTitle>Nyhetsbrev med extra värde – vi meddelar dig när:</BenefitsTitle>
          <BenefitsList>
            <BenefitItem>
              Ditt avtal går ut
            </BenefitItem>
            <BenefitItem>
              En ny kampanj är tillgänglig
            </BenefitItem>
            <BenefitItem>
              Det är dags att byta för att undvika dyrare el
            </BenefitItem>
          </BenefitsList>
        </NewsletterBenefits>

        <Benefits>
          <Benefit>
            <RocketIcon />
            <h3>Exklusiva erbjudanden</h3>
            <p>Få först tillgång till de bästa elpriserna</p>
          </Benefit>
          <Benefit>
            <ChartIcon />
            <h3>Elprisuppdateringar</h3>
            <p>Håll dig uppdaterad om marknadens utveckling</p>
          </Benefit>
          <Benefit>
            <PiggyIcon />
            <h3>Sparatips</h3>
            <p>Få tips för att minska din elräkning</p>
          </Benefit>
        </Benefits>
      </Container>
    </NewsletterHeroSection>
  );
} 