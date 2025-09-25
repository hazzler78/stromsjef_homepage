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
        <Title>Cookiepolicy för Elchef.se</Title>
        <Updated>Senast uppdaterad: September 2024</Updated>

        <SectionTitle>Vad är cookies?</SectionTitle>
        <Paragraph>
          Cookies är små textfiler som sparas på din dator, mobil eller surfplatta när du besöker en webbplats. De används för att webbplatsen ska fungera, för att förbättra användarupplevelsen och för att samla in statistik.
        </Paragraph>

        <SectionTitle>Vilka cookies använder vi?</SectionTitle>
        <Paragraph>
          På Elchef.se använder vi:
        </Paragraph>
        <List>
          <li><b>Nödvändiga cookies:</b> Krävs för att webbplatsen ska fungera korrekt, t.ex. för att komma ihåg dina val och inställningar.</li>
          <li><b>Analyscookies:</b> Hjälper oss att förstå hur besökare använder webbplatsen, så att vi kan förbättra innehåll och funktionalitet. Vi använder t.ex. Google Analytics.</li>
          <li><b>Marknadsföringscookies:</b> Kan användas för att visa relevanta erbjudanden och annonser, men vi använder i dagsläget ingen tredjepartsannonsering.</li>
        </List>

        <SectionTitle>Hur kan du hantera cookies?</SectionTitle>
        <Paragraph>
          Du kan själv välja att blockera eller ta bort cookies via inställningarna i din webbläsare. Tänk på att vissa funktioner på webbplatsen kan sluta fungera om du blockerar alla cookies.
        </Paragraph>

        <SectionTitle>Samtycke</SectionTitle>
        <Paragraph>
          När du besöker Elchef.se för första gången får du information om att vi använder cookies. Genom att fortsätta använda webbplatsen samtycker du till vår användning av cookies enligt denna policy.
        </Paragraph>

        <SectionTitle>Kontakta oss</SectionTitle>
        <Paragraph>
          Har du frågor om vår cookiepolicy? Kontakta oss på <Mail href="mailto:info@elchef.se">info@elchef.se</Mail>.
        </Paragraph>
      </Container>
    </Section>
  );
} 