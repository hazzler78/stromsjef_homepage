"use client";

import React from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

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
  position: relative;
  z-index: 10;
`;

const RorligtLabel = styled(ButtonLabel)`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.15);
`;

const FastprisLabel = styled(ButtonLabel)`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
`;

export default function BytElavtal() {
  const handleRorligtClick = () => {
    window.location.href = '/rorligt-avtal';
  };

  const handleFastprisClick = () => {
    window.location.href = '/fastpris-avtal';
  };

  return (
    <PageContainer>
      <Content>
        <Title>Byt elavtal</Title>
        <Subtitle>Välj vilken typ av avtal du vill ha och fyll i formuläret.</Subtitle>
        
        <ButtonContainer>
          <ButtonWrapper>
            <div
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
              onClick={handleRorligtClick}
            >
              <GlassButton 
                variant="primary" 
                size="lg"
                background="linear-gradient(135deg, var(--primary), var(--secondary))"
                aria-label="Rörligt avtal - 0 kr i avgifter första året – utan bindningstid"
                disableScrollEffect={true}
                disableHoverEffect={true}
              >
                Rörligt avtal
              </GlassButton>
            </div>
            <RorligtLabel>
              0 kr i avgifter första året – utan bindningstid
            </RorligtLabel>
          </ButtonWrapper>

          <ButtonWrapper>
            <div
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
              onClick={handleFastprisClick}
            >
              <GlassButton 
                variant="secondary" 
                size="lg"
                background="linear-gradient(135deg, var(--secondary), var(--primary))"
                aria-label="Fastpris - Fastpris med prisgaranti"
                disableScrollEffect={true}
                disableHoverEffect={true}
              >
                Fastpris
              </GlassButton>
            </div>
            <FastprisLabel>
              Fastpris med prisgaranti
            </FastprisLabel>
          </ButtonWrapper>
        </ButtonContainer>
      </Content>
    </PageContainer>
  );
}