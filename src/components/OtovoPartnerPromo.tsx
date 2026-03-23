"use client";

import styled from 'styled-components';
import Image from 'next/image';
import GlassButton from './GlassButton';

const OTOVO_LOGO_SRC = '/NO%20%20Otovo%20care%20launch%20.png';

const HREF_QUOTE = 'https://www.otovo.no/?utm_source=Str%C3%B8msjef_no_P';
const HREF_CARE = 'https://www.otovo.no/partner/Stromsjef_care/';

function trackOtovoClick(buttonType: 'otovo_quote' | 'otovo_care', href: string) {
  try {
    const sessionId =
      typeof window !== 'undefined' ? window.localStorage.getItem('invoice_session_id') || '' : '';
    const payload = JSON.stringify({
      buttonType,
      href,
      sessionId,
      source: 'otovo_home',
    });
    const url = '/api/events/chat-click';
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(
        () => {}
      );
    }
  } catch {
    /* noop */
  }
}

const Section = styled.section`
  padding: 2rem 0 1rem;
  background: transparent;

  @media (min-width: 768px) {
    padding: 2.5rem 0 1.5rem;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow-light);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  color: var(--foreground);
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    align-items: center;
    gap: 2rem;
  }
`;

const LogoWrap = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 260px;

  img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
  }
`;

const Copy = styled.div`
  flex: 1;

  h2 {
    margin: 0 0 0.75rem;
    font-size: 1.5rem;
    color: var(--foreground);

    @media (min-width: 768px) {
      font-size: 1.65rem;
    }
  }

  p {
    margin: 0 0 1.25rem;
    color: var(--gray-700);
    line-height: 1.55;
    font-size: 1rem;
  }
`;

/** Outline-knappar i GlassButton har vit text (för mörk hero) – på lyst kort behövs mörk text. */
const CareLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--primary);
  color: var(--primary);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: var(--glass-shadow-light);
  line-height: 1.2;
  text-align: center;

  &:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow-medium);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;

  @media (min-width: 480px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
`;

export default function OtovoPartnerPromo() {
  return (
    <Section aria-labelledby="otovo-partner-heading">
      <div className="container">
        <Card>
          <Inner>
            <LogoWrap>
              <Image
                src={OTOVO_LOGO_SRC}
                alt="Otovo"
                width={520}
                height={200}
                sizes="(max-width: 768px) 100vw, 260px"
                style={{ width: '100%', height: 'auto' }}
                priority={false}
              />
            </LogoWrap>
            <Copy>
              <h2 id="otovo-partner-heading">Solceller fra Otovo</h2>
              <p>
                Vi samarbeider med Otovo om installasjon og service av solceller – et godt
                supplement hvis du vil senke strømregningen på lengre sikt, i tillegg til å
                finne en rimelig strømavtale.
              </p>
              <ButtonRow>
                <GlassButton
                  as="a"
                  href={HREF_QUOTE}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="md"
                  disableScrollEffect
                  onClick={() => trackOtovoClick('otovo_quote', HREF_QUOTE)}
                >
                  Få tilbud på solceller
                </GlassButton>
                <CareLink
                  href={HREF_CARE}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOtovoClick('otovo_care', HREF_CARE)}
                >
                  Otovo Care
                </CareLink>
              </ButtonRow>
            </Copy>
          </Inner>
        </Card>
      </div>
    </Section>
  );
}
