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

export default function Villkor() {
  return (
    <Section>
      <Container>
        <Title>Brukervilkår for Strømsjef.no</Title>
        <Updated>Denne avtalen ble sist endret: Juli 2025</Updated>

        <SectionTitle>1. Strømsjef.no og våre tjenester</SectionTitle>
        <Paragraph>
          VKNG LTD (referert til som «Strømsjef.no», «vi», eller «oss») tilbyr en plattform for formidling av strømavtaler via Strømsjef.no.
        </Paragraph>
        <Paragraph>
          Formålet med tjenesten er å gjøre det enklere for forbrukere å finne en god strømavtale ved å presentere et utvalg av forhandlede avtaler.
        </Paragraph>

        <SectionTitle>2. Brukervilkår</SectionTitle>
        <Paragraph>
          Disse vilkårene gjelder for all bruk av vår nettside og våre tjenester. Vi ber deg lese vilkårene nøye. Ved å bruke vår nettside erkjenner du at du har lest, forstått og aksepterer vilkårene. Hvis du ikke godtar disse, skal du ikke bruke nettsiden vår.
        </Paragraph>

        <SectionTitle>3. Bruk av nettsiden</SectionTitle>
        <Paragraph>
          Du forplikter deg til å bruke nettsiden i samsvar med gjeldende lover og regler. Misbruk av nettsiden, inkludert forsøk på å omgå sikkerhetstiltak eller uautorisert tilgang til systemer, vil kunne føre til utestengelse.
        </Paragraph>

        <SectionTitle>4. Endringer i vilkårene</SectionTitle>
        <Paragraph>
          Strømsjef.no forbeholder seg retten til å oppdatere brukervilkårene ved behov, men kun når dette er nødvendig på grunn av endringer i lovgivning, regulatoriske krav, tekniske justeringer eller forbedringer av våre tjenester.
        </Paragraph>
        <Paragraph>
          Alle endringer vil bli varslet på vår nettside minst 14 dager før de trer i kraft, med mindre endringene er nødvendige av sikkerhetsmessige årsaker eller for å oppfylle lovpålagte krav, hvor endringer vil tre i kraft umiddelbart.
        </Paragraph>

        <SectionTitle>5. Tilbud fra strømleverandører</SectionTitle>
        <Paragraph>
          Strømsjef.no kan presentere tilbud fra alle strømleverandører som er oppført på Forbrukertilsynets strømportal.
        </Paragraph>
        <Paragraph>
          Vårt mål er å gi deg et bredt utvalg av strømavtaler, slik at du kan velge den som best passer dine behov.
        </Paragraph>

        <SectionTitle>6. Kontaktinformasjon</SectionTitle>
        <Paragraph>
          For spørsmål om brukervilkår, vennligst kontakt oss på <Mail href="mailto:post@stromsjef.no">post@stromsjef.no</Mail>
        </Paragraph>

        <SectionTitle>7. Angrerett</SectionTitle>
        <Paragraph>
          Du har angrerett ved inngåelse av strømavtale over nett. For nærmere informasjon om hvordan du kan benytte deg av angreretten, henvises det til avtalen med strømleverandøren.
        </Paragraph>

        <SectionTitle>8. Feil ved tjenestene</SectionTitle>
        <Paragraph>
          Strømsjef.no er ikke ansvarlig for tap eller skade som følge av bruk av tjenestene eller informasjonen på nettstedet, heller ikke ved manglende tilgjengelighet av informasjon. Vi garanterer ikke at nettsiden alltid vil være tilgjengelig eller fri for feil.
        </Paragraph>
        <Paragraph>
          Strømleverandøren er ansvarlig for å levere i henhold til avtalen du inngår med dem. Strømsjef.no representerer ikke strømleverandørene. Ved feil, kontakt strømleverandøren direkte. Gi beskjed innen rimelig tid etter at feilen ble oppdaget.
        </Paragraph>

        <SectionTitle>9. Priser og betaling</SectionTitle>
        <Paragraph>
          Bruken av Strømsjef.no er gratis. Det påløper ingen ekstra kostnader på strømregningen ved å bruke våre tjenester.
        </Paragraph>
        <Paragraph>
          Strømleverandørene oppgir prisene for strømavtalene. Vi prøver å holde prisene og avtalevilkårene oppdatert, men tar forbehold om endringer gjort av strømleverandørene. Strømsjef.no kan ikke garantere at all informasjon er korrekt, da denne innhentes fra tredjeparter.
        </Paragraph>
        <Paragraph>
          Betalingen gjøres direkte til den valgte strømleverandøren i henhold til avtalen du inngår med dem.
        </Paragraph>

        <SectionTitle>10. Konfliktløsning og verneting</SectionTitle>
        <Paragraph>
          Eventuelle tvister skal forsøkes løst i minnelighet. Hvis dette ikke lykkes, kan kjøperen kontakte Forbrukertilsynet for mekling. Forbrukertilsynet kan nås på telefon 23 400 600 eller www.forbrukertilsynet.no
        </Paragraph>

        <SectionTitle>11. Lovvalg og verneting</SectionTitle>
        <Paragraph>
          Disse brukervilkårene er underlagt norsk lov. Partene vedtar Oslo tingrett som rett verneting.
        </Paragraph>
      </Container>
    </Section>
  );
} 