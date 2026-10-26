"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  formatNorwegianPhoneDisplay,
  isValidNorwegianPostalCode,
  isValidNorwegianPoststed,
  isValidNorwegianStreetAddress,
  normalizeNorwegianPhone,
} from '@/lib/norwegian-lead-validation';

const Section = styled.section`
  background: linear-gradient(160deg, rgba(0, 106, 167, 0.15) 0%, rgba(254, 204, 0, 0.08) 100%);
  padding: var(--section-spacing) 0;
  color: white;
`;

const Container = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const Title = styled.h2`
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: white;
  text-shadow: var(--text-shadow);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Form = styled.form`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-light);
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  color: var(--foreground);
  font-size: 1rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  transition: all var(--transition-normal) ease;

  &::placeholder {
    color: #64748b;
    opacity: 1;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 106, 167, 0.15);
    transform: translateY(-1px);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  color: var(--foreground);
  font-size: 1rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: all var(--transition-normal) ease;

  &::placeholder {
    color: #64748b;
    opacity: 1;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 106, 167, 0.15);
    transform: translateY(-1px);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ConsentRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: var(--text-shadow);
  cursor: pointer;

  input {
    margin-top: 0.2rem;
    flex-shrink: 0;
    width: 1.1rem;
    height: 1.1rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow-light);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--glass-shadow-medium);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FormNote = styled.p`
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.9rem;
  line-height: 1.55;
  text-align: center;
  margin: 1rem auto 0;
  max-width: 480px;
`;

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
`;

function validateClientForm(formData: {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  city: string;
  address: string;
  otovoConsent: boolean;
}): string | null {
  if (!formData.name.trim()) return 'Fyll inn navn.';
  if (!formData.email.includes('@')) return 'Ugyldig e-postadresse.';
  if (!normalizeNorwegianPhone(formData.phone)) return 'Oppgi et gyldig norsk mobilnummer (8 siffer).';
  if (!isValidNorwegianPostalCode(formData.postalCode)) return 'Oppgi et gyldig norsk postnummer (4 siffer).';
  if (!isValidNorwegianPoststed(formData.city)) return 'Oppgi poststed.';
  if (!isValidNorwegianStreetAddress(formData.address)) return 'Oppgi gateadresse.';
  if (!formData.otovoConsent) return 'Du må samtykke til at vi deler opplysningene med Otovo.';
  return null;
}

export default function SolarQuoteFormNo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    postalCode: '',
    city: '',
    address: '',
    consumption: '',
    message: '',
    otovoConsent: false,
  });
  const [ref, setRef] = useState<string | null>(null);
  const [campaignCode, setCampaignCode] = useState<string | null>(null);

  React.useEffect(() => {
    const refMatch = document.cookie.match(/(?:^|; )elchef_affiliate=([^;]+)/);
    const campMatch = document.cookie.match(/(?:^|; )elchef_campaign=([^;]+)/);
    if (refMatch) setRef(decodeURIComponent(refMatch[1]));
    if (campMatch) setCampaignCode(decodeURIComponent(campMatch[1]));
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setErrorDetail(null);

    const validationError = validateClientForm(formData);
    if (validationError) {
      setErrorDetail(validationError);
      setSubmitStatus('error');
      return;
    }

    const phoneNational = normalizeNorwegianPhone(formData.phone);
    if (!phoneNational) {
      setSubmitStatus('error');
      setErrorDetail('Ugyldig telefonnummer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formatNorwegianPhoneDisplay(phoneNational),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          consumption: formData.consumption || undefined,
          message: formData.message || undefined,
          subscribeNewsletter: false,
          otovoConsent: true,
          ref: ref || 'sol_laddbox',
          campaignCode: campaignCode || undefined,
          formType: 'sol_laddbox',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          postalCode: '',
          city: '',
          address: '',
          consumption: '',
          message: '',
          otovoConsent: false,
        });
      } else {
        const body = await response.json().catch(() => ({}));
        setErrorDetail(typeof body.error === 'string' ? body.error : null);
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Section id="solceller">
      <Container>
        <Title>Ta neste steg mot lavere strømregning</Title>
        <Subtitle>
          Når strømavtalen er på plass, kan solceller og batteri redusere kostnadene ytterligere. Send en
          uforpliktende forespørsel – vi kobler deg til Otovo, vår solcellepartner.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="solar-name">Navn *</Label>
            <Input
              type="text"
              id="solar-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ditt navn"
              required
              autoComplete="name"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="solar-email">E-post *</Label>
            <Input
              type="email"
              id="solar-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="din@epost.no"
              required
              autoComplete="email"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="solar-phone">Mobiltelefon *</Label>
            <Input
              type="tel"
              id="solar-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="912 34 567"
              required
              autoComplete="tel"
            />
          </FormGroup>
          <FormGroup>
            <Row>
              <div>
                <Label htmlFor="solar-postal">Postnummer *</Label>
                <Input
                  type="text"
                  id="solar-postal"
                  name="postalCode"
                  inputMode="numeric"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="0150"
                  required
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <Label htmlFor="solar-city">Poststed *</Label>
                <Input
                  type="text"
                  id="solar-city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Oslo"
                  required
                  autoComplete="address-level2"
                />
              </div>
            </Row>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="solar-address">Gateadresse *</Label>
            <Input
              type="text"
              id="solar-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Eksempelveien 1"
              required
              autoComplete="street-address"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="solar-consumption">Årlig strømforbruk (kWh)</Label>
            <Input
              type="text"
              id="solar-consumption"
              name="consumption"
              value={formData.consumption}
              onChange={handleChange}
              placeholder="F.eks. 15 000 kWh"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="solar-message">Annet (valgfritt)</Label>
            <Textarea
              id="solar-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="F.eks. interesse for batteri eller taktype"
              rows={2}
            />
          </FormGroup>
          <FormGroup>
            <ConsentRow>
              <input
                type="checkbox"
                name="otovoConsent"
                checked={formData.otovoConsent}
                onChange={handleChange}
                required
              />
              <span>
                Jeg samtykker til at Strømsjef deler navn, kontaktinformasjon og adresse med Otovo slik at de
                kan kontakte meg med et uforpliktende tilbud på solceller. Les mer i{' '}
                <a href="/personvernpolicy" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  personvernerklæringen
                </a>
                .
              </span>
            </ConsentRow>
          </FormGroup>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sender …' : 'Be om gratis tilbud'}
          </SubmitButton>
          <FormNote>
            Otovo tar kontakt for et kostnadsfritt tilbud. Du bestemmer selv om du vil gå videre – ingen
            forpliktelse.
          </FormNote>
        </Form>

        {submitStatus === 'success' && (
          <SuccessMessage>
            Takk! Vi har mottatt forespørselen din. Otovo kontakter deg for et uforpliktende tilbud.
          </SuccessMessage>
        )}
        {submitStatus === 'error' && (
          <ErrorMessage>
            {errorDetail ||
              'Noe gikk galt. Kontroller at alle obligatoriske felt er riktig utfylt, og prøv igjen.'}
          </ErrorMessage>
        )}
      </Container>
    </Section>
  );
}
