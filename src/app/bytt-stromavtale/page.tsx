"use client";

import React from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import { withDefaultCtaUtm } from '@/lib/utm';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 3rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    gap: 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;

  @media (min-width: 768px) {
    min-width: 200px;
  }
`;

const ButtonLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  padding: 0.35rem 0.6rem;
  border-radius: 9999px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
`;

const RorligtLabel = styled(ButtonLabel)`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
`;

const FastprisLabel = styled(ButtonLabel)`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
`;

export default function ByttStromavtale() {
  return (
    <PageContainer>
      <Content>
        <Title>Bytt strømavtale</Title>
        <Subtitle>Velg type avtale og fyll ut skjemaet for å starte byttet.</Subtitle>

        <ButtonContainer>
          <ButtonWrapper>
            <GlassButton
              variant="primary"
              size="lg"
              background="linear-gradient(135deg, var(--primary), var(--secondary))"
              aria-label="Spotprisavtale – 0 kr i avgifter første året"
              disableScrollEffect
              disableHoverEffect
              onClick={() => {
                window.location.href = withDefaultCtaUtm('/rorligt-avtal', 'bytt-stromavtale', 'spot');
              }}
            >
              Spotprisavtale
            </GlassButton>
            <RorligtLabel>0 kr i avgifter første året – uten bindingstid</RorligtLabel>
          </ButtonWrapper>

          <ButtonWrapper>
            <GlassButton
              variant="secondary"
              size="lg"
              background="linear-gradient(135deg, var(--secondary), var(--primary))"
              aria-label="Fastpris med prisgaranti"
              disableScrollEffect
              disableHoverEffect
              onClick={() => {
                window.location.href = withDefaultCtaUtm('/fastpris-avtal', 'bytt-stromavtale', 'fast');
              }}
            >
              Fastpris
            </GlassButton>
            <FastprisLabel>Fastpris med prisgaranti</FastprisLabel>
          </ButtonWrapper>
        </ButtonContainer>
      </Content>
    </PageContainer>
  );
}