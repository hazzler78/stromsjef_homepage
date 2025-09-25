"use client";

import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

const DemoSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: white;
  font-size: 3rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 4rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const DemoCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: all var(--transition-normal) ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glass-shadow-medium);
  }

  h3 {
    color: var(--gray-700);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: var(--gray-600);
    margin-bottom: 1.5rem;
  }
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const InputDemo = styled.div`
  margin-top: 1rem;
`;

const GlassInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all var(--transition-normal) ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 201, 107, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

const FloatingElement = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin: 1rem 0;
  animation: float 3s ease-in-out infinite;
`;

const ShimmerElement = styled.div`
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  height: 4px;
  border-radius: 2px;
  margin: 1rem 0;
`;

export default function GlassmorphismDemo() {
  return (
    <DemoSection>
      <Container>
        <Title>Glassmorphism Design Demo</Title>
        <Subtitle>
          Utforska alla Apple-inspirerade glassmorphism-effekter och komponenter
        </Subtitle>

        <Grid>
          <DemoCard>
            <h3>GlassButton Variants</h3>
            <p>Olika varianter av glassmorphism-knappar med scroll-effekter</p>
            <ButtonGrid>
              <GlassButton variant="primary" size="sm">
                Primary Small
              </GlassButton>
              <GlassButton variant="secondary" size="md">
                Secondary
              </GlassButton>
              <GlassButton variant="outline" size="lg">
                Outline Large
              </GlassButton>
            </ButtonGrid>
          </DemoCard>

          <DemoCard>
            <h3>Glass Input Fields</h3>
            <p>Halvgenomskinliga input-fält med focus-effekter</p>
            <InputDemo>
              <GlassInput placeholder="Skriv här..." />
            </InputDemo>
            <InputDemo>
              <GlassInput placeholder="E-postadress" type="email" />
            </InputDemo>
          </DemoCard>

          <DemoCard>
            <h3>Floating Animation</h3>
            <p>Element som svävar upp och ner med glassmorphism-effekt</p>
            <FloatingElement>
              🐸 Denna groda svävar!
            </FloatingElement>
          </DemoCard>

          <DemoCard>
            <h3>Shimmer Effect</h3>
            <p>Skimmer-effekt som glider över element</p>
            <ShimmerElement />
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Lägg till klassen &quot;shimmer&quot; för att aktivera effekten
            </p>
          </DemoCard>

          <DemoCard>
            <h3>Glass Cards</h3>
            <p>Kort med glassmorphism-design och hover-effekter</p>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)',
              marginTop: '1rem'
            }}>
              <p style={{ color: 'white', margin: 0 }}>
                Detta är ett glassmorphism-kort med halvgenomskinlighet
              </p>
            </div>
          </DemoCard>

          <DemoCard>
            <h3>Scroll Parallax</h3>
            <p>Knappar som rör sig i förhållande till scroll</p>
            <ButtonGrid>
              <GlassButton variant="primary">
                Scroll för att se effekten
              </GlassButton>
            </ButtonGrid>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '1rem' }}>
              Scrolla sidan för att se hur knapparna rör sig
            </p>
          </DemoCard>
        </Grid>

        <DemoCard style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h3>CSS Utility Classes</h3>
          <p>Använd dessa klasser för att snabbt lägga till glassmorphism-effekter:</p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginTop: '1rem',
            textAlign: 'left'
          }}>
            <div>
              <strong>.glass</strong> - Grundläggande glassmorphism
            </div>
            <div>
              <strong>.glass-heavy</strong> - Tydligare glassmorphism
            </div>
            <div>
              <strong>.glass-card</strong> - Glassmorphism-kort
            </div>
            <div>
              <strong>.glass-input</strong> - Glassmorphism-input
            </div>
            <div>
              <strong>.float</strong> - Svävande animation
            </div>
            <div>
              <strong>.shimmer</strong> - Skimmer-effekt
            </div>
          </div>
        </DemoCard>
      </Container>
    </DemoSection>
  );
} 