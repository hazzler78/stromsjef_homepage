"use client";

import styled from 'styled-components';
import GoHomeButton from './GoHomeButton';

export const metadata = {
  title: 'Om oss - Strømsjef | Din strømpris-ekspert',
  description: 'Lær mer om Strømsjef og vårt team. Vi hjelper deg å finne det beste strømavtalet og bytte enkelt og raskt. Gratis tjeneste for alle.',
  keywords: 'om strømsjef, strømpris-ekspert, strømavtale-hjelp, strømleverandør-sammenligning',
  openGraph: {
    title: 'Om oss - Strømsjef',
    description: 'Lær mer om Strømsjef og vårt team. Vi hjelper deg å finne det beste strømavtalet.',
    url: 'https://stromsjef.se/om-oss',
  },
};

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
        <Title>Stromsjef.no – Om oss</Title>
        <Lead>
          <b>Hvem er vi – og hvorfor finnes Stromsjef.no?</b>
        </Lead>
        <p>
          Strømmarkedet i Norge er ett stort kaos. Over 100 strømselskaper, en jungel av strømavtaler og prismodeller, og mengder av påslag, faste avgifter og ekstratjenester sniker seg inn på regningen. Mange har ingen aning om hva de faktisk betaler for – og det vet strømselskapene. Det er akkurat der de tjener sine penger.
        </p>
        <p>
          Vi opprettet Stromsjef.no fordi vi var lei av å se mennesker betale for mye – uten å engang vite om det. Vi har sett hvor vanskelig det er å finne en god strømavtale blant alle tilbud, påslag og finstilt.
        </p>
        <p>
          Vi som står bak Stromsjef.no har selv jobbet i bransjen i over 30 år. Vi har sett hvordan det fungerer bak kulissene – og hvor vanskelig det er for vanlige mennesker å vite hva som er en god avtale, og hva som bare ser bra ut på overflaten.
        </p>
        <List>
          <li>Vi er <b>ikke</b> et strømselskap.</li>
          <li>Du får aldri en strømregning fra oss.</li>
          <li>Vi jobber helt uavhengig og samarbeider med flere strømleverandører for å løfte frem kampanjer og rabatter som faktisk gjør forskjell – inkludert unike tilbud som bare gjelder via Stromsjef.no.</li>
          <li>Samtidig leter vi aktivt etter nye strømselskaper som vil tilby skikkelige og prisverdige avtaler, uten skjulte avgifter eller unødvendige tillegg.</li>
        </List>
        <p>
          Vårt mål er å gi deg kontrollen tilbake. Du skal slippe å legge timer på å lete selv. Vi viser bare frem avtaler som er verdt å vurdere – med tydelige vilkår og priser du faktisk forstår.
        </p>
        <Quote>
          Du trenger ikke å forstå hele strømmarkedet – det er vår jobb.<br />
          Du trenger bare å ta en beslutning: å bli Strømsjef i ditt eget hjem.
        </Quote>
        <CTA>
          <GoHomeButton />
        </CTA>
      </Container>
    </Section>
  );
} 