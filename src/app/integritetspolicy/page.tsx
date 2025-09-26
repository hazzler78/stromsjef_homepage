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

export default function Integritetspolicy() {
  return (
    <Section>
      <Container>
        {/* TikTok Site Verification */}
        <div style={{ fontSize: '1px', color: 'transparent', position: 'absolute', left: '-9999px' }}>
          tiktok-developers-site-verification=i7h859t0QF0G6Dua8q4h9qJUXwuPQoof
        </div>
        <Title>PERSONVERN</Title>
        <Updated>Denne avtalen ble sist endret: Juli 2025</Updated>

        <Paragraph>
          Denne erklæringen gir deg informasjon om hvordan VKNG LTD, organisasjonsnummer HE477501 (heretter kalt «Selskapet»), håndterer dine personopplysninger, og hvilke rettigheter du har ved bruk av vår nettside "Stromsjef.no". Denne erklæringen gjelder for deg som bruker våre nettsider.
        </Paragraph>

        <Paragraph>
          Personopplysninger refererer til informasjon som kan identifisere en fysisk person. Behandling av personopplysninger inkluderer enhver bruk av slik informasjon, både automatisk og manuelt, som innsamling, strukturering, lagring og sletting.
        </Paragraph>

        <Paragraph>
          <strong>Kontaktinformasjon behandlingsansvarlig:</strong>
        </Paragraph>
        <Paragraph>
          Navn: VKNG LTD
        </Paragraph>
        <Paragraph>
          Org.nr.: HE477501
        </Paragraph>
        <Paragraph>
          E-post: <Mail href="mailto:post@stromsjef.no">post@stromsjef.no</Mail>
        </Paragraph>

        <SectionTitle>1. Behandling av personopplysninger ved bruk av våre tjenester</SectionTitle>
        <Paragraph>
          Når du bruker Stromsjef.no til å velge strømavtaler, kan det hende vi samler inn opplysninger som postnummer og strømforbruk som kan knyttes til deg via din IP-adresse. Denne behandlingen er basert på en interesseavveining, jf. GDPR artikkel 6 bokstav f. Vi kan anse det som nødvendig å samle inn disse opplysningene for å kunne levere vår tjeneste.
        </Paragraph>

        <SectionTitle>2. Behandling av personopplysninger ved henvendelser</SectionTitle>
        <Paragraph>
          Hvis du kontakter oss via nettsiden eller andre kanaler, kan det hende vi behandler opplysninger som navn, telefonnummer, e-postadresse og eventuelle andre opplysninger som fremkommer av henvendelsen. Denne behandlingen er også basert på en interesseavveining, jf. GDPR artikkel 6 bokstav f. Vi trenger disse opplysningene for å kunne følge opp henvendelsen din på en god måte.
        </Paragraph>

        <SectionTitle>3. Samarbeid med eksterne</SectionTitle>
        <Paragraph>
          For å kunne samarbeide med og følge opp våre kunder, leverandører og andre samarbeidspartnere, lagrer vi nødvendig informasjon for å oppfylle våre kontraktsforpliktelser. Dette kan inkludere navn, e-post, telefonnummer og eventuelle andre nødvendige opplysninger. Behandlingen kan være basert på å oppfylle en avtale, jf. GDPR artikkel 6 bokstav b, eller våre berettigede interesser, jf. GDPR artikkel 6 bokstav f.
        </Paragraph>

        <SectionTitle>4. Nyhetsbrev og markedsføring</SectionTitle>
        <Paragraph>
          Ved å registrere din e-post samtykker du til at vi kan sende nyhetsbrev og markedsføring via e-post. Vi sender også nyhetsbrev og markedsføring til eksisterende kunder. Behandlingen av opplysninger som navn og kontaktinformasjon for dette formålet er basert på samtykke, jf. GDPR artikkel 6 bokstav a, eller våre berettigede interesser, jf. GDPR artikkel 6 bokstav f. Du kan når som helst trekke tilbake samtykket ved å kontakte oss.
        </Paragraph>

        <SectionTitle>5. Deling av personopplysninger</SectionTitle>
        <Paragraph>
          Selskapet deler dine personopplysninger kun med andre hvis det er nødvendig for å oppfylle formålet med behandlingen, og hvis det foreligger et grunnlag for slik deling. Dette kan inkludere å sende informasjon videre til strømleverandører vi samarbeider med når du fyller ut skjema for å motta tilbud eller inngå avtaler. Våre databehandlere kan ikke bruke dine opplysninger til egne formål og er bundet av databehandleravtaler. All behandling skjer innenfor EU/EØS-området.
        </Paragraph>

        <SectionTitle>6. Dine rettigheter</SectionTitle>
        <Paragraph>
          Du har rett til å be om innsyn i, retting av, eller sletting av dine personopplysninger. Du kan også kreve begrenset behandling, motsette deg behandlingen, og be om dataportabilitet. For mer informasjon om disse rettighetene, besøk Datatilsynets nettside: www.datatilsynet.no.
        </Paragraph>
        <Paragraph>
          For å utøve dine rettigheter, kontakt oss via e-post. Vi vil svare så raskt som mulig. Vi kan be om bekreftelse på din identitet for å sikre at vi gir tilgang til riktige opplysninger.
        </Paragraph>

        <SectionTitle>7. Lagringstid</SectionTitle>
        <Paragraph>
          Vi oppbevarer dine personopplysninger så lenge det er nødvendig for formålet de ble samlet inn for, med mindre vi er lovpålagt å lagre dem lenger.
        </Paragraph>

        <SectionTitle>8. Klager</SectionTitle>
        <Paragraph>
          Hvis du mener vår behandling av personopplysninger ikke er i samsvar med denne erklæringen eller personvernlovgivningen, kan du klage til Datatilsynet. Besøk www.datatilsynet.no for mer informasjon om hvordan du kan kontakte dem.
        </Paragraph>
      </Container>
    </Section>
  );
} 