"use client";

import React from 'react';
import styled from 'styled-components';
import SalesysForm, { SalesysFormInstance, SalesysFormField } from '@/components/SalesysForm';

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

const SupplierInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const SupplierLogo = styled.img`
  height: 60px;
  margin-bottom: 1rem;
  object-fit: contain;
`;

const SupplierText = styled.p`
  color: #333;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
`;


const PromoTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #111827;
`;

const PromoBullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem 0;
`;

const PromoBullet = styled.li`
  margin: 0.2rem 0;
  color: #111827;
  font-weight: 600;
`;

const PromoText = styled.p`
  margin: 0;
  color: #374151;
  line-height: 1.5;
`;

// Removed unused AffiliateButton component

// Removed unused FormNote component

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export default function RorligtAvtalPage() {
  // Formulärsida för rörligt elavtal - optimerad för mobil
  const [showSupplier, setShowSupplier] = React.useState(true);
  function handleFormReady(formInstance?: SalesysFormInstance) {
    try {
      const container = document.getElementById('rorligt-avtal-container');
      if (!container) return;
      const findPnInput = () => {
        // Direct attributes
        const attrSelector = 'input[placeholder*="personnummer" i], input[name*="personnummer" i], input[id*="personnummer" i], input[aria-label*="personnummer" i]';
        const inp = container.querySelector<HTMLInputElement>(attrSelector);
        if (inp) return inp;
        // Via label[for]
        const labels = Array.from(container.querySelectorAll('label')) as HTMLLabelElement[];
        for (const lbl of labels) {
          if ((lbl.textContent || '').toLowerCase().includes('personnummer')) {
            const forId = lbl.getAttribute('for');
            if (forId) {
              const candidate = container.querySelector<HTMLInputElement>(`#${CSS.escape(forId)}`);
              if (candidate) return candidate;
            }
          }
        }
        // Heuristic: nearest input below a text node that includes the word
        const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        for (const candidate of inputs) {
          const parentText = (candidate.parentElement?.textContent || '').toLowerCase();
          if (parentText.includes('personnummer')) return candidate;
        }
        return null;
      };
      const pnInput = findPnInput();
      // If input not directly accessible (likely iframe), fallback to polling formInstance.getFields
      if (!pnInput && formInstance && typeof formInstance.getFields === 'function') {
        let fired = false;
        const startedAt = Date.now();
        const intervalId = window.setInterval(() => {
          if (fired) return;
          try {
            const fields = formInstance.getFields?.() as SalesysFormField[] | undefined;
            if (Array.isArray(fields)) {
              const pnField = fields.find((f: SalesysFormField) => {
                const key = `${f?.name || ''} ${f?.label || ''}`.toLowerCase();
                return key.includes('personnummer');
              });
              const raw = pnField?.value || '';
              const digits = String(raw).replace(/\D/g, '');
              if (digits.length >= 10) {
                const masked = digits.length >= 4 ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : '*'.repeat(digits.length);
                fetch('/api/events/form-field', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    form: 'rorligt-avtal',
                    field: 'personnummer',
                    action: 'filled',
                    valueMasked: masked,
                  }),
                  keepalive: true,
                }).catch(() => {});
                setShowSupplier(true);
                fired = true;
                window.clearInterval(intervalId);
              }
            }
          } catch {}
          if (Date.now() - startedAt > 2 * 60 * 1000) {
            window.clearInterval(intervalId);
          }
        }, 500);
        return;
      }
      if (!pnInput) return;

      const fireOnce = () => {
        try {
          const digits = (pnInput.value || '').replace(/\D/g, '');
          if (digits.length >= 10) {
            const masked = digits.length >= 4 ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : '*'.repeat(digits.length);
            fetch('/api/events/form-field', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                form: 'rorligt-avtal',
                field: 'personnummer',
                action: 'filled',
                valueMasked: masked,
              }),
              keepalive: true,
            }).catch(() => {});
            setShowSupplier(true);
            pnInput.removeEventListener('blur', fireOnce);
            pnInput.removeEventListener('change', fireOnce);
            pnInput.removeEventListener('input', onInput);
          }
        } catch {}
      };

      const onInput = () => {
        const digits = (pnInput.value || '').replace(/\D/g, '');
        if (digits.length >= 10) fireOnce();
      };

      pnInput.addEventListener('blur', fireOnce);
      pnInput.addEventListener('change', fireOnce);
      pnInput.addEventListener('input', onInput);
      // Immediate check if redan ifyllt
      onInput();
      // Inga fallbacks - rutan visas direkt
    } catch {}
  }
  return (
    <PageContainer>
      <Content>
        <Title>Byt elavtal</Title>
        <Subtitle>Fyll i formuläret nedan för att påbörja bytet.</Subtitle>

        {showSupplier && (
          <SupplierInfo>
            <SupplierLogo src="/cheap-logo.png" alt="Cheap Energi" />
            <SupplierText>Du kommer att få ett rörligt elavtal från Cheap Energi</SupplierText>
            <PromoTitle style={{ marginTop: '1rem' }}>Kampanjpris i 12 månader</PromoTitle>
            <PromoBullets>
              <PromoBullet>0 kr i månadsavgift – 0 öre i påslag</PromoBullet>
            </PromoBullets>
            <PromoText>
              Byt elavtal idag och ta del av ett riktigt förmånligt erbjudande. Du betalar endast för den el du använder – inga dolda avgifter, inga påslag. Gäller i 12 månader från startdatumet.
            </PromoText>
          </SupplierInfo>
        )}
        

        <FormContainer>
          <SalesysForm
            containerId="rorligt-avtal-container"
            formId="68b05450a1479b5cec96958c"
            options={{ 
              width: "100%", 
              test: process.env.NODE_ENV === 'development' 
            }}
            defaultFields={[
              { fieldId: "66e9457420ef2d3b8c66f500", value: "2000" }
            ]}
            onReady={handleFormReady}
          />
        </FormContainer>
      </Content>
    </PageContainer>
  );
}
