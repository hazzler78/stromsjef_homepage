"use client";

import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;
const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;
const Updated = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
`;
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
`;
const Paragraph = styled.p`
  margin-bottom: 1.2rem;
  color: #374151;
`;
const Mail = styled.a`
  color: var(--primary);
  text-decoration: underline;
`;
const List = styled.ul`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  li {
    margin-bottom: 0.5rem;
  }
`;

export default function Cookies() {
  return (
    <Section>
      <Container>
        <Title>Cookiepolicy for Strømsjef.se</Title>
        <Updated>Sist oppdatert: September 2024</Updated>

        <SectionTitle>Hva er cookies?</SectionTitle>
        <Paragraph>
          Cookies er små tekstfiler som lagres på din enhet når du besøker et nettsted. De brukes for at siden skal fungere, for å forbedre brukeropplevelsen og for å samle statistikk.
        </Paragraph>

        <SectionTitle>Hvilke cookies bruker vi?</SectionTitle>
        <Paragraph>
          På Strømsjef.se bruker vi:
        </Paragraph>
        <List>
          <li><b>Nødvendige cookies:</b> Kreves for at nettstedet skal fungere riktig, f.eks. for å huske dine valg og innstillinger.</li>
          <li><b>Analyse-cookies:</b> Hjelper oss å forstå hvordan besøkende bruker siden, slik at vi kan forbedre innhold og funksjonalitet. Vi bruker f.eks. Google Analytics.</li>
          <li><b>Markedsføringscookies:</b> Kan brukes for å vise relevante tilbud, men vi bruker per i dag ingen tredjepartsannonsering.</li>
        </List>

        <SectionTitle>Hvordan kan du håndtere cookies?</SectionTitle>
        <Paragraph>
          Du kan selv blokkere eller slette cookies i nettleserinnstillingene. Merk at enkelte funksjoner kan slutte å fungere om du blokkerer alle cookies.
        </Paragraph>

        <SectionTitle>Samtykke</SectionTitle>
        <Paragraph>
          Når du besøker Strømsjef.se første gang får du informasjon om bruk av cookies. Ved å fortsette å bruke nettstedet samtykker du til vår bruk av cookies i henhold til denne policyen.
        </Paragraph>

        <SectionTitle>Kontakt oss</SectionTitle>
        <Paragraph>
          Har du spørsmål om vår cookiepolicy? Kontakt oss på <Mail href="mailto:info@stromsjef.se">info@stromsjef.se</Mail>.
        </Paragraph>
      </Container>
    </Section>
  );
} 