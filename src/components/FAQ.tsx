"use client";

import { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const FAQSection = styled.section`
  padding: 4rem 1rem;
  background: transparent;
  border-radius: var(--radius-lg);
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AccordionItem = styled.div`
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: var(--glass-shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

const AccordionHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$isOpen ? 'var(--gray-50)' : 'white'};
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: var(--gray-700);
  text-align: left;

  svg {
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s;
    color: var(--primary);
  }

  &:hover {
    background: var(--gray-50);
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 1.25rem 1.25rem' : '0 1.25rem'};
  color: var(--gray-600);
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: ${props => props.$isOpen ? '1' : '0'};

  p {
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const faqData = [
  {
    question: "Hvordan finner jeg gode strømavtaler?",
    answer: "Hvis du ikke finner en avtale du vil ha på vår side, kan du registrere din e-postadresse i skjemaet nederst på siden. Dette gir deg muligheten til å sikre gode priser, før tilbud med begrenset kapasitet blir fullbooket."
  },
  {
    question: "Hvordan fungerer Strømsjef.se?",
    answer: "Strømsjef.se forhandler frem gode strømavtaler fra ulike leverandører og gir deg muligheten til å velge den avtalen som passer deg best. Du kan være sikker på at de tilbudene du finner her er konkurransedyktige på markedet!"
  },
  {
    question: "Hva skal jeg velge? Fastpris, Rørlig timepris eller Rørlig månedspris?",
    answer: "Det avhenger av din livsstil og hva du føler deg komfortabel med. Med en fastprisavtale har du forutsigbarhet under hele avtaleperioden. Med rørlig pris følger din strømpris markedets svingninger men kan eventuelt spare penger på lengre sikt. Spør deg selv: Tror du at strømprisene kommer til å bli billigere eller dyrere fremover?"
  },
  {
    question: "Hva er en Strømsjef?",
    answer: "En \"Strømsjef\" tar kontroll over sin strømavtale for å holde kostnadene nede. Du er en strømsjef når du gjør et bevisst valg for å sikre en bedre avtale og unngå å betale mer enn nødvendig."
  },
  {
    question: "Må jeg si opp min gamle strømavtale hvis jeg bytter leverandør?",
    answer: "Nei, du trenger vanligvis ikke å si opp din gamle strømavtale selv. Når du bytter strømleverandør håndterer den nye leverandøren vanligvis byttet for deg, inkludert oppsigelsen av din tidligere avtale. Det er imidlertid bra å kontrollere vilkårene i din nåværende avtale, spesielt hvis du har en fastprisavtale, siden det kan finnes oppsigelsestid eller avgifter for å avslutte avtalen i forveien."
  },
  {
    question: "Er det noen avgift for å si opp en strømavtale?",
    answer: `Rørlige strømavtaler kan vanligvis sies opp uten avgift og har normalt en oppsigelsestid på en måned.

Fastprisavtaler derimot har en bindingsperiode, og hvis du vil avslutte avtalen i forveien kan det komme en bryteavgift (også kalt løsningsavgift). Avgiften varierer mellom ulike leverandører og avhenger av hvor lang tid som gjenstår av avtalen samt strømprisutviklingen.

Det er alltid best å kontrollere vilkårene i din avtale eller kontakte din strømleverandør for å få eksakt informasjon om hva som gjelder ved en oppsigelse.`
  },
  {
    question: "Hvilket strømområde/strømsone tilhører jeg?",
    answer: `Norge er delt inn i fem strømområder:

NO1 - Øst-Norge
NO2 - Sør-Norge
NO3 - Midt-Norge
NO4 - Nord-Norge
NO5 - Vest-Norge

Hvilket strømområde du tilhører avhenger av hvor du bor og påvirker strømprisen i din region. Du kan se ditt strømområde på din strømregning, ved å kontakte din nettleverandør, eller bruke skjemaet i våre avtalelister.`
  },
  {
    question: "Hva bør jeg tenke på når jeg velger strømavtale?",
    answer: "Velg strømavtale ut fra din økonomiske situasjon og din risikotoleranse. Hvis du har et stramt budsjett og vil unngå prissvingninger kan en fastprisavtale være et bra alternativ. Rørlige avtaler (spotpris) har historisk sett vært billigere over tid, men innebærer større risiko for prisvariasjoner. Tenk på hva som passer din situasjon best før du gjør ditt valg."
  },
  {
    question: "Kan jeg angre min strømavtale?",
    answer: `Ja, ifølge angrerettloven har du angrerett i 14 dager når du inngår en avtale på avstand, som for eksempel digitalt eller via telefon. Det betyr at du kan angre avtalen uten kostnad innen denne perioden. Det finnes imidlertid unntak:

• Hvis du har betalt for forbrukt strøm under angreperioden kan leverandøren kreve erstatning for den strømmen du har brukt.
• Angreretten gjelder ikke hvis du har inngått avtalen gjennom et personlig møte hos leverandøren eller i en butikk.
• Noen leverandører kan ha egne vilkår gjelende oppsigelse etter angrefristen, så det er alltid bra å lese avtalen nøye.
• Hvis du vil angre din avtale skal du meddele leverandøren skriftlig, via e-post eller angreskjema.`
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FAQSection>
      <Container>
        <Title>Vanlige spørsmål</Title>
        {faqData.map((faq, index) => (
          <AccordionItem key={index}>
            <AccordionHeader
              onClick={() => toggleAccordion(index)}
              $isOpen={openIndex === index}
            >
              {faq.question}
              <FaChevronDown />
            </AccordionHeader>
            <AccordionContent $isOpen={openIndex === index}>
              <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Container>
    </FAQSection>
  );
} 