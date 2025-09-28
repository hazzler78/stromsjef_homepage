"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

const ContactSection = styled.section`
  background: transparent;
  padding: var(--section-spacing) 0;
  color: white;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const Title = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 700;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Form = styled.form`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  padding: 2rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-light);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
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
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
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
  min-height: 100px;
  transition: all var(--transition-normal) ease;

  &::placeholder {
    color: #64748b;
    opacity: 1;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 106, 167, 0.15);
    transform: translateY(-1px);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  transform: scale(1.2);
  flex-shrink: 0;
`;

const CheckboxLabel = styled.label`
  font-size: 1rem;
  color: white;
  cursor: pointer;
  text-shadow: var(--text-shadow);
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow-light);
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--glass-shadow-medium);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    newsletter: false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Validation: phone and email are required
    if (!formData.email || !formData.phone) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subscribeNewsletter: formData.newsletter,
          ref,
          campaignCode,
          formType: 'contact'
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          message: '', 
          newsletter: false
        });
      } else {
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
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <ContactSection>
      <Container>
        <Title>Kontakt oss</Title>
        <Subtitle>
          Har du spørsmål om strømavtale eller trenger hjelp? Vi er her for deg!
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Navn</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              // not required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">E-post *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Melding</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Fortell mer om hva du trenger hjelp med..."
            />
          </FormGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="newsletter">
              Jeg godkjenner å motta nyhetsbrev fra Strømsjef med tilbud og oppdateringer om strømpriser. 
              Du kan når som helst melde deg av via lenken i e‑posten. Jeg godkjenner også <a href="/villkor" target="_blank" style={{color: 'var(--primary)', textDecoration: 'underline'}}>brukervilkårene</a> og <a href="/integritetspolicy" target="_blank" style={{color: 'var(--primary)', textDecoration: 'underline'}}>personvernpolicyen</a>.
            </CheckboxLabel>
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sender...' : 'Send melding'}
          </SubmitButton>
        </Form>

        {submitStatus === 'success' && (
          <SuccessMessage>
            ✅ Takk for din melding! Vi kommer tilbake så snart som mulig.
          </SuccessMessage>
        )}

        {submitStatus === 'error' && (
          <ErrorMessage>
            ❌ En feil oppstod. Kontroller at du har fylt ut alle obligatoriske felt og prøv igjen.
          </ErrorMessage>
        )}
      </Container>
    </ContactSection>
  );
} 