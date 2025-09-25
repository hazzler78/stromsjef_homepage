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
        <Title>Integritetspolicy för elchef.se</Title>
        <Updated>Senast uppdaterad: Augusti 2025</Updated>

        <SectionTitle>1. Vårt ansvar för din personuppgifter</SectionTitle>
        <Paragraph>
          VKNG LTD (benämnt som &quot;Elchef.se&quot;, &quot;vi&quot; eller &quot;oss&quot;) är personuppgiftsansvarig för behandlingen av dina personuppgifter när du använder vår webbplats elchef.se. Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar din personliga information.
        </Paragraph>

        <SectionTitle>2. Vilka personuppgifter vi samlar in</SectionTitle>
        <Paragraph>
          Vi samlar in information som du ger oss direkt, såsom namn, e-postadress, telefonnummer och adress när du använder våra tjänster. Vi samlar också in teknisk information om hur du använder webbplatsen, inklusive IP-adress, webbläsartyp och besöksdata.
        </Paragraph>

        <SectionTitle>3. Hur vi använder dina personuppgifter</SectionTitle>
        <Paragraph>
          Vi använder dina personuppgifter för att tillhandahålla våra tjänster, förbättra användarupplevelsen, kommunicera med dig och följa lagkrav. Vi delar inte dina personuppgifter med tredje part utan ditt samtycke, förutom när det krävs för att leverera våra tjänster.
        </Paragraph>

        <SectionTitle>4. Behandling av fakturabilder (OCR)</SectionTitle>
        <Paragraph>
          När du laddar upp en bild av din elräkning för analys behandlas bilden för att vi ska kunna ge dig en analys här och nu. Denna omedelbara behandling sker med stöd av avtal/berättigat intresse och bilden behöver inte sparas permanent för att tjänsten ska fungera.
        </Paragraph>
        <Paragraph>
          <strong>Samtycke för lagring:</strong> Om du vill hjälpa oss att förbättra tjänsten kan du ge ett <em>frivilligt, uttryckligt samtycke</em> till att vi lagrar din fakturabild under en begränsad tid för kvalitetssäkring och utveckling. Samtycke lämnas via en omarkerad kryssruta i samband med uppladdningen och kan återkallas när som helst.
        </Paragraph>
        <Paragraph>
          <strong>Vad som kan lagras vid samtycke:</strong>
        </Paragraph>
        <ul>
          <li>Originalbilden av fakturan</li>
          <li>Teknisk metadata om bilden (t.ex. filtyp och storlek)</li>
          <li>Bildens kryptografiska kontrollsumma (SHA‑256) för identifiering/deduplicering</li>
          <li>Koppling till sessions‑ID och tidpunkt för uppladdning</li>
        </ul>
        <Paragraph>
          <strong>Lagring, mottagare och överföringar:</strong> Bilder lagras i en privat, åtkomstskyddad lagringslösning hos vår driftleverantör (Supabase). För OCR/analys använder vi en AI‑leverantör (OpenAI) som biträde. Behandlingen kan innebära överföring av uppgifter utanför EU/EES; i sådant fall används standardavtalsklausuler (SCC) och andra relevanta skyddsåtgärder enligt GDPR.
        </Paragraph>
        <Paragraph>
          <strong>Lagringstid:</strong> Vid samtycke sparas fakturabilden i upp till 90 dagar, därefter raderas den automatiskt. Du kan när som helst återkalla ditt samtycke, varpå vi raderar bilden snarast möjligt.
        </Paragraph>
        <Paragraph>
          <strong>Utan samtycke:</strong> Vi sparar inte själva bilden. Vi kan dock spara AI:ns textanalys och begränsad teknisk metadata (t.ex. hashvärde) för felsökning, statistik och för att förhindra dubbla uppladdningar.
        </Paragraph>

        <SectionTitle>5. Dina rättigheter</SectionTitle>
        <Paragraph>
          Du har rätt att få information om vilka personuppgifter vi har om dig, begära rättelse av felaktig information, begära radering av dina uppgifter och invända mot vår behandling. Du kan också begära att få dina uppgifter överförda till en annan leverantör.
        </Paragraph>

        <SectionTitle>6. Cookies och spårning</SectionTitle>
        <Paragraph>
          Vi använder cookies och liknande tekniker för att förbättra webbplatsens funktionalitet och analysera användningsmönster. Du kan hantera dina cookie-inställningar i din webbläsare.
        </Paragraph>

        <SectionTitle>7. Säkerhet</SectionTitle>
        <Paragraph>
          Vi implementerar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot obehörig åtkomst, förlust eller förstörelse.
        </Paragraph>

        <SectionTitle>8. Kontakt</SectionTitle>
        <Paragraph>
          Vid frågor om denna integritetspolicy eller vår behandling av personuppgifter, kontakta oss via e-post: <Mail href="mailto:info@elchef.se">info@elchef.se</Mail>
        </Paragraph>

        <SectionTitle>9. Ändringar av denna policy</SectionTitle>
        <Paragraph>
          Vi kan uppdatera denna integritetspolicy vid behov. Alla ändringar meddelas på webbplatsen och träder i kraft när de publiceras.
        </Paragraph>
      </Container>
    </Section>
  );
} 