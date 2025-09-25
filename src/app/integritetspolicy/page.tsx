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
        <Title>Personvernerklæring for stromsjef.se</Title>
        <Updated>Sist oppdatert: August 2025</Updated>

        <SectionTitle>1. Vårt ansvar for dine personopplysninger</SectionTitle>
        <Paragraph>
          VKNG LTD (benevnt som «Strømsjef.se», «vi» eller «oss») er behandlingsansvarlig når du bruker vårt nettsted stromsjef.se. Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter dine opplysninger.
        </Paragraph>

        <SectionTitle>2. Hvilke personopplysninger vi samler inn</SectionTitle>
        <Paragraph>
          Vi samlar in information som du ger oss direkt, såsom namn, e-postadress, telefonnummer och adress när du använder våra tjänster. Vi samlar också in teknisk information om hur du använder webbplatsen, inklusive IP-adress, webbläsartyp och besöksdata.
        </Paragraph>

        <SectionTitle>3. Hvordan vi bruker personopplysningene</SectionTitle>
        <Paragraph>
          Vi använder dina personuppgifter för att tillhandahålla våra tjänster, förbättra användarupplevelsen, kommunicera med dig och följa lagkrav. Vi delar inte dina personuppgifter med tredje part utan ditt samtycke, förutom när det krävs för att leverera våra tjänster.
        </Paragraph>

        <SectionTitle>4. Behandling av fakturabilder (OCR)</SectionTitle>
        <Paragraph>
          När du laddar upp en bild av din elräkning för analys behandlas bilden för att vi ska kunna ge dig en analys här och nu. Denna omedelbara behandling sker med stöd av avtal/berättigat intresse och bilden behöver inte sparas permanent för att tjänsten ska fungera.
        </Paragraph>
        <Paragraph>
          <strong>Samtykke til lagring:</strong> Dersom du vil hjelpe oss å forbedre tjenesten kan du gi et <em>frivillig, uttrykkelig samtykke</em> til at vi lagrer fakturabildet ditt i en begrenset periode for kvalitetssikring og utvikling. Samtykke gis via en avmerket avkrysningsboks ved opplasting og kan trekkes tilbake når som helst.
        </Paragraph>
        <Paragraph>
          <strong>Hva som kan lagres ved samtykke:</strong>
        </Paragraph>
        <ul>
          <li>Originalbilden av fakturan</li>
          <li>Teknisk metadata om bilden (t.ex. filtyp och storlek)</li>
          <li>Bildens kryptografiska kontrollsumma (SHA‑256) för identifiering/deduplicering</li>
          <li>Koppling till sessions‑ID och tidpunkt för uppladdning</li>
        </ul>
        <Paragraph>
          <strong>Lagring, mottakere og overføringer:</strong> Bilder lagres i en privat, tilgangsbeskyttet lagringsløsning hos vår driftsleverandør (Supabase). For OCR/analyse bruker vi en AI‑leverandør (OpenAI) som databehandler. Behandlingen kan innebære overføring av opplysninger utenfor EU/EØS; i slike tilfeller brukes standard kontraktsklausuler (SCC) og relevante sikkerhetstiltak i henhold til GDPR.
        </Paragraph>
        <Paragraph>
          <strong>Lagringstid:</strong> Ved samtykke lagres fakturabildet i opptil 90 dager før det slettes automatisk. Du kan når som helst trekke tilbake samtykket, og vi sletter bildet så snart som mulig.
        </Paragraph>
        <Paragraph>
          <strong>Uten samtykke:</strong> Vi lagrer ikke selve bildet. Vi kan lagre AI‑analysen og begrenset teknisk metadata (f.eks. hashverdi) for feilsøking, statistikk og for å forhindre duplikater.
        </Paragraph>

        <SectionTitle>5. Dine rettigheter</SectionTitle>
        <Paragraph>
          Du har rätt att få information om vilka personuppgifter vi har om dig, begära rättelse av felaktig information, begära radering av dina uppgifter och invända mot vår behandling. Du kan också begära att få dina uppgifter överförda till en annan leverantör.
        </Paragraph>

        <SectionTitle>6. Cookies og sporing</SectionTitle>
        <Paragraph>
          Vi använder cookies och liknande tekniker för att förbättra webbplatsens funktionalitet och analysera användningsmönster. Du kan hantera dina cookie-inställningar i din webbläsare.
        </Paragraph>

        <SectionTitle>7. Sikkerhet</SectionTitle>
        <Paragraph>
          Vi implementerar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot obehörig åtkomst, förlust eller förstörelse.
        </Paragraph>

        <SectionTitle>8. Kontakt</SectionTitle>
        <Paragraph>
          Ved spørsmål om denne personvernerklæringen eller vår behandling av personopplysninger, kontakt oss via e‑post: <Mail href="mailto:info@stromsjef.se">info@stromsjef.se</Mail>
        </Paragraph>

        <SectionTitle>9. Endringer</SectionTitle>
        <Paragraph>
          Vi kan oppdatere denne personvernerklæringen ved behov. Alle endringer publiseres på nettstedet og trer i kraft ved publisering.
        </Paragraph>
      </Container>
    </Section>
  );
} 