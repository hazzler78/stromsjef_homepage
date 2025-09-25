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
        <Title>Användarvillkor för elchef.se</Title>
        <Updated>Senast uppdaterad: Juli 2025</Updated>

        <SectionTitle>1. Elchef.se och våra tjänster</SectionTitle>
        <Paragraph>
          VKNG LTD (benämnt som &quot;Elchef.se&quot;, &quot;vi&quot; eller &quot;oss&quot;) tillhandahåller en plattform för att förmedla elavtal via elchef.se. Syftet med tjänsten är att göra det enklare för konsumenter att hitta ett fördelaktigt elavtal genom att presentera ett urval av förhandlade erbjudanden.
        </Paragraph>

        <SectionTitle>2. Användarvillkor</SectionTitle>
        <Paragraph>
          Dessa villkor gäller all användning av vår webbplats och våra tjänster. Läs dem noggrant. Genom att använda vår webbplats bekräftar du att du har läst, förstått och accepterat villkoren. Om du inte godkänner dem, ska du inte använda vår webbplats.
        </Paragraph>

        <SectionTitle>3. Användning av webbplatsen</SectionTitle>
        <Paragraph>
          Du förbinder dig att använda webbplatsen i enlighet med gällande lagar och regler. Missbruk, inklusive försök att kringgå säkerhetssystem eller få obehörig åtkomst, kan leda till avstängning.
        </Paragraph>

        <SectionTitle>4. Ändringar av villkoren</SectionTitle>
        <Paragraph>
          Elchef.se förbehåller sig rätten att uppdatera användarvillkoren vid behov – till exempel på grund av lagändringar, tekniska justeringar eller förbättringar av tjänsten. Alla ändringar meddelas på webbplatsen minst 14 dagar i förväg, utom vid brådskande säkerhets- eller lagkrav där ändringar kan gälla omedelbart.
        </Paragraph>

        <SectionTitle>5. Erbjudanden från elbolag</SectionTitle>
        <Paragraph>
          Elchef.se kan visa erbjudanden från alla elbolag som är listade i Konsumentverkets elpriskollen. Målet är att ge dig en bred överblick så att du kan välja det avtal som passar dig bäst.
        </Paragraph>

        <SectionTitle>6. Kontakt</SectionTitle>
        <Paragraph>
          Vid frågor om användarvillkoren, kontakta oss via e-post: <Mail href="mailto:info@elchef.se">info@elchef.se</Mail>
        </Paragraph>

        <SectionTitle>7. Ångerrätt</SectionTitle>
        <Paragraph>
          Du har rätt att ångra ett elavtal som tecknats via nätet. För detaljer om hur du utövar ångerrätten, hänvisas till elbolagets avtalsvillkor.
        </Paragraph>

        <SectionTitle>8. Fel i tjänsten</SectionTitle>
        <Paragraph>
          Elchef.se ansvarar inte för skador eller förluster till följd av användning av tjänsten eller brist på tillgänglig information. Vi kan inte garantera att webbplatsen alltid är tillgänglig eller felfri. Elbolaget ansvarar för att leverera enligt det avtal du ingår. Elchef.se representerar inte elbolagen. Vid fel ska du kontakta elbolaget direkt, så snart felet upptäcks.
        </Paragraph>

        <SectionTitle>9. Priser och betalning</SectionTitle>
        <Paragraph>
          Det är gratis att använda Elchef.se. Det tillkommer inga extra kostnader på din elräkning. Elpriserna sätts av respektive elbolag. Vi strävar efter att hålla priserna och villkoren uppdaterade, men reserverar oss för ändringar som görs av tredje part. Betalning sker direkt till det elbolag du valt, enligt deras avtal.
        </Paragraph>

        <SectionTitle>10. Tvister och tillämplig lag</SectionTitle>
        <Paragraph>
          Tvister ska i första hand lösas genom dialog. Om det inte lyckas kan du vända dig till Konsumentverket eller Allmänna reklamationsnämnden. Dessa villkor lyder under svensk lag. Tvister hanteras av svensk domstol.
        </Paragraph>
      </Container>
    </Section>
  );
} 