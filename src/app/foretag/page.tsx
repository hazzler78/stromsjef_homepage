"use client";

import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255,255,255,0.8);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
  text-align: center;
`;
const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;
const Lead = styled.p`
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 2rem;
`;

export default function Foretag() {
  return (
    <Section>
      <Container>
        <Title>Strømavtale for bedrift</Title>
        <Lead>
          En bedriftsavtale for strøm gir virksomheten mulighet til å tilpasse energiløsningene etter behov og forbruk. Med riktig avtale kan dere få forutsigbare kostnader, økt fleksibilitet og trygghet mot markedsvingninger – slik at dere kan fokusere på det viktigste: å drive virksomheten effektivt.
        </Lead>
        <GlassButton 
          variant="primary" 
          size="lg" 
          onClick={() => window.open('https://www.vstrom.no/renspot?utm_source=stromsjef&utm_medium=cpc&utm_campaign=renspot', '_blank')}
          background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
        >
          Les mer & tegn bedriftsavtale
        </GlassButton>
      </Container>
    </Section>
  );
} 