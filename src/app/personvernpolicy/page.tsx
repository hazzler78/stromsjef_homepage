import styled from 'styled-components';

export const metadata = {
  title: 'Personvernpolicy - Strømsjef.no',
  description: 'Personvernpolicy for Strømsjef.no - hvordan vi håndterer dine personopplysninger.',
  openGraph: {
    title: 'Personvernpolicy - Strømsjef.no',
    description: 'Personvernpolicy for Strømsjef.no - hvordan vi håndterer dine personopplysninger.',
    url: 'https://stromsjef.no/personvernpolicy',
  },
};

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

export default function Personvernpolicy() {
  return (
    <Section>
      <Container>
        {/* TikTok Site Verification */}
        <div style={{ fontSize: '1px', color: 'transparent', position: 'absolute', left: '-9999px' }}>
          i7h859t0QF0G6Dua8q4h9qJUXwuPQoof
        </div>
        
        <Title>Personvernpolicy for Strømsjef.no</Title>
        <Updated>Sist oppdatert: September 2024</Updated>

        <SectionTitle>1. Innsamling av personopplysninger</SectionTitle>
        <Paragraph>
          Vi samler inn personopplysninger som er nødvendige for å gi deg våre tjenester. Dette inkluderer:
        </Paragraph>
        <ul style={{ marginBottom: '1.2rem', color: '#374151', paddingLeft: '1.5rem' }}>
          <li>E-postadresse for å sende deg tilbud og oppdateringer</li>
          <li>Postnummer for å finne relevante strømavtaler for ditt område</li>
          <li>Kontaktinformasjon hvis du velger å kontakte oss direkte</li>
        </ul>

        <SectionTitle>2. Bruk av personopplysninger</SectionTitle>
        <Paragraph>
          Vi bruker dine personopplysninger til å:
        </Paragraph>
        <ul style={{ marginBottom: '1.2rem', color: '#374151', paddingLeft: '1.5rem' }}>
          <li>Finne og presentere relevante strømavtaler for deg</li>
          <li>Sende deg tilbud og oppdateringer om strømavtaler</li>
          <li>Forbedre våre tjenester og brukeropplevelse</li>
          <li>Kommunisere med deg om våre tjenester</li>
        </ul>

        <SectionTitle>3. Deling av personopplysninger</SectionTitle>
        <Paragraph>
          Vi deler ikke dine personopplysninger med tredjeparter uten ditt samtykke, bortsett fra:
        </Paragraph>
        <ul style={{ marginBottom: '1.2rem', color: '#374151', paddingLeft: '1.5rem' }}>
          <li>Strømleverandører når du velger å bytte strømavtale</li>
          <li>Tjenesteleverandører som hjelper oss med å drive nettsiden</li>
          <li>Når det kreves av lov</li>
        </ul>

        <SectionTitle>4. Datasikkerhet</SectionTitle>
        <Paragraph>
          Vi implementerer passende tekniske og organisatoriske tiltak for å beskytte dine personopplysninger mot uautorisert tilgang, endring, utlevering eller ødeleggelse.
        </Paragraph>

        <SectionTitle>5. Dine rettigheter</SectionTitle>
        <Paragraph>
          Du har rett til å:
        </Paragraph>
        <ul style={{ marginBottom: '1.2rem', color: '#374151', paddingLeft: '1.5rem' }}>
          <li>Få tilgang til dine personopplysninger</li>
          <li>Kreve retting av feilaktige opplysninger</li>
          <li>Kreve sletting av dine personopplysninger</li>
          <li>Trekke tilbake ditt samtykke</li>
          <li>Klage til Datatilsynet</li>
        </ul>

        <SectionTitle>6. Cookies</SectionTitle>
        <Paragraph>
          Vi bruker cookies for å forbedre din brukeropplevelse og analysere trafikk. Du kan kontrollere cookies gjennom nettleserinnstillingene dine.
        </Paragraph>

        <SectionTitle>7. Kontakt oss</SectionTitle>
        <Paragraph>
          Hvis du har spørsmål om denne personvernpolicyen, kan du kontakte oss på <Mail href="mailto:post@stromsjef.no">post@stromsjef.no</Mail>
        </Paragraph>

        <SectionTitle>8. Endringer i personvernpolicyen</SectionTitle>
        <Paragraph>
          Vi kan oppdatere denne personvernpolicyen fra tid til annen. Eventuelle endringer vil bli publisert på denne siden med en oppdatert dato.
        </Paragraph>
      </Container>
    </Section>
  );
}
