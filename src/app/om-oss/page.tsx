"use client";

import styled from 'styled-components';
import GoHomeButton from './GoHomeButton';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.8);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;
const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;
const Lead = styled.p`
  font-size: 1.2rem;
  color: #374151;
  margin-bottom: 2rem;
`;
const List = styled.ul`
  margin-bottom: 2rem;
  li {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
`;
const Quote = styled.blockquote`
  font-style: italic;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 2rem 0;
`;
const CTA = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

export default function OmOss() {
  return (
    <Section>
      <Container>
        <Title>Elchef.se – Om oss</Title>
        <Lead>
          <b>Vilka är vi – och varför finns Elchef.se?</b>
        </Lead>
        <p>
          Elmarknaden i Sverige är ett enda stort kaos. Över 100 elbolag, en djungel av elavtal och prismodeller, och mängder av påslag, fasta avgifter och extratjänster smyger sig in på fakturan. Många har ingen aning om vad de faktiskt betalar för – och det vet elbolagen. Det är just där de tjänar sina pengar.
        </p>
        <p>
          Vi skapade Elchef.se för att vi var trötta på att se människor betala för mycket – utan att ens veta om det. Vi har sett hur svårt det är att hitta ett bra elavtal bland alla erbjudanden, påslag och finstilt.
        </p>
        <p>
          Vi som står bakom Elchef.se har själva jobbat i branschen i över 30 år. Vi har sett hur det fungerar bakom kulisserna – och hur svårt det är för vanliga människor att veta vad som är ett bra avtal, och vad som bara ser bra ut på ytan.
        </p>
        <List>
          <li>Vi är <b>inte</b> ett elbolag.</li>
          <li>Du får aldrig en elräkning från oss.</li>
          <li>Vi jobbar helt oberoende och samarbetar med flera elleverantörer för att lyfta fram kampanjer och rabatter som faktiskt gör skillnad – inklusive unika erbjudanden som bara gäller via Elchef.se.</li>
          <li>Samtidigt letar vi aktivt efter nya elbolag som vill erbjuda schyssta och prisvärda avtal, utan dolda avgifter eller onödiga tillägg.</li>
        </List>
        <p>
          Vårt mål är att ge dig kontrollen tillbaka. Du ska slippa lägga timmar på att leta själv. Vi visar bara fram avtal som är värda att överväga – med tydliga villkor och priser du faktiskt förstår.
        </p>
        <Quote>
          Du behöver inte förstå hela elmarknaden – det är vårt jobb.<br />
          Du behöver bara fatta ett beslut: att bli Elchef i ditt eget hem.
        </Quote>
        <CTA>
          <GoHomeButton />
        </CTA>
      </Container>
    </Section>
  );
} 