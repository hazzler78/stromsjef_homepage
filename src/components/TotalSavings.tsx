"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';

const SavingsSection = styled.section`
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(0, 106, 167, 0.08) 0%, rgba(254, 204, 0, 0.08) 100%);
  border-top: 1px solid rgba(0, 106, 167, 0.2);
  border-bottom: 1px solid rgba(0, 106, 167, 0.2);
  position: relative;
  overflow: hidden;
`;

const SavingsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const SavingsContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 106, 167, 0.25);
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 106, 167, 0.12);
  position: relative;
  overflow: hidden;
`;

const SavingsTitle = styled.h2`
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SavingsAmount = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: var(--primary);
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

const SavingsSubtitle = styled.p`
  font-size: 1.1rem;
  color: #374151;
  margin: 0;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 106, 167, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 1rem;
  margin: 0;
`;

interface SavingsData {
  totalSavings: number;
  formattedSavings: string;
  count: number;
}

export default function TotalSavings() {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/total-savings');
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta besparingsdata');
        }
        
        const data = await response.json();
        setSavingsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod');
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, []);

  if (loading) {
    return (
      <SavingsSection>
        <div className="container">
          <SavingsContainer>
            <SavingsContent>
              <SavingsTitle>Så här mycket pengar har vi sparat svenska folket!</SavingsTitle>
              <LoadingSpinner />
              <SavingsSubtitle>Laddar besparingsdata...</SavingsSubtitle>
            </SavingsContent>
          </SavingsContainer>
        </div>
      </SavingsSection>
    );
  }

  if (error) {
    return (
      <SavingsSection>
        <div className="container">
          <SavingsContainer>
            <SavingsContent>
              <SavingsTitle>Så här mycket pengar har vi sparat svenska folket!</SavingsTitle>
              <ErrorMessage>{error}</ErrorMessage>
            </SavingsContent>
          </SavingsContainer>
        </div>
      </SavingsSection>
    );
  }

  return (
    <SavingsSection>
      <div className="container">
        <SavingsContainer>
          <SavingsContent>
            <SavingsTitle>Så här mycket pengar har vi sparat svenska folket!</SavingsTitle>
            <SavingsAmount>{savingsData?.formattedSavings || '0 kr'}</SavingsAmount>
            <SavingsSubtitle>
              Baserat på {savingsData?.count || 0} elavtalsbyten genom vår tjänst
            </SavingsSubtitle>
          </SavingsContent>
        </SavingsContainer>
      </div>
    </SavingsSection>
  );
}
