"use client";

import styled from 'styled-components';
import ContactForm from '@/components/ContactForm';

const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const ContactInfo = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Lead = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  text-shadow: var(--text-shadow);
`;

const Phone = styled.div`
  margin-top: 1rem;
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-shadow: var(--text-shadow);
`;

const PhoneNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PhoneLink = styled.a`
  color: #22c55e;
  text-decoration: underline;
  font-weight: 700;
  transition: color var(--transition-normal) ease;
  
  &:hover {
    color: #16a34a;
  }
`;

const OpeningHours = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
`;

export default function Kontakt() {
  return (
    <Section>
      <Container>
        <ContactInfo>
          <Title>Kontakt oss</Title>
          <Lead>
            Har du spørsmål eller vil komme i kontakt med oss? 
            Fyll ut skjemaet nedenfor eller ring oss direkte så kommer vi tilbake så snart vi kan.
          </Lead>
          <Phone>
            <PhoneNumber>
              Ring oss direkte: <PhoneLink href="tel:+46736862360">+46 73 68 62 360</PhoneLink>
            </PhoneNumber>
            <OpeningHours>09:00-13:00 Hverdager</OpeningHours>
          </Phone>
        </ContactInfo>
        
        <ContactForm />
      </Container>
    </Section>
  );
} 