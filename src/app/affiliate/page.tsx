"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255,255,255,0.85);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #0f172a;
`;

const Lead = styled.p`
  font-size: 1.1rem;
  color: #334155;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
`;

const Form = styled.form`
  margin-top: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  min-height: 100px;
`;

const Button = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 0.9rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
`;

const Small = styled.p`
  font-size: 0.85rem;
  color: #64748b;
`;

const Prose = styled.div`
  line-height: 1.6;
  color: #334155;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 2rem 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #eef2ff;
  padding: 0.4rem;
  border-radius: 9999px;
  width: fit-content;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 0.9rem;
  background: ${p => (p.$active ? 'white' : 'transparent')};
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
`;

export default function AffiliatePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    channel: '',
    followers: '',
    notes: '',
  });
  const [ref, setRef] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [activeTab, setActiveTab] = useState<'influencer' | 'company'>('influencer');

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    orgNumber: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
  });
  const [companyStatus, setCompanyStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )elchef_affiliate=([^;]+)/);
    if (m) setRef(decodeURIComponent(m[1]));
    const c = document.cookie.match(/(?:^|; )elchef_campaign=([^;]+)/);
    if (c) setCampaign(decodeURIComponent(c[1]));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ref, campaignCode: campaign }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', channel: '', followers: '', notes: '' });
    } catch {
      setStatus('error');
    }
  };

  const onSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyStatus('sending');
    try {
      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...companyForm, ref, campaignCode: campaign }),
      });
      if (!res.ok) throw new Error('Request failed');
      setCompanyStatus('success');
      setCompanyForm({
        companyName: '', orgNumber: '', contactName: '', email: '', phone: '', website: '', notes: ''
      });
    } catch {
      setCompanyStatus('error');
    }
  };

  return (
    <Section>
      <Container>
        <Title>Bli partner med Elchef</Title>
        <Lead>
          Har du många följare eller driver en community? Ansök om att bli partner och få en unik länk.
        </Lead>

        <Tabs>
          <TabButton $active={activeTab==='influencer'} onClick={()=>setActiveTab('influencer')}>Influencer / Affiliate</TabButton>
          <TabButton $active={activeTab==='company'} onClick={()=>setActiveTab('company')}>Företagspartner</TabButton>
        </Tabs>

        <Grid>
          <Card>
            <b>Provision</b>
            <Small>Fast ersättning per kvalificerad lead. Detaljer bekräftas vid godkännande.</Small>
          </Card>
          <Card>
            <b>Spårning</b>
            <Small>Ref-kod i URL (t.ex. ?ref=dittnamn) lagras i 30 dagar.</Small>
          </Card>
          <Card>
            <b>Kampanjkod</b>
            <Small>
              Du kan få en kampanjkod (t.ex. ELJAN25) för dina följare. Koden kopplas till din ref och lagras i 30 dagar.
            </Small>
          </Card>
        </Grid>

        {activeTab === 'influencer' && (
        <Form onSubmit={onSubmit}>
          <Row>
            <div>
              <Label>Namn</Label>
              <Input value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} required />
            </div>
            <div>
              <Label>E-post</Label>
              <Input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email: e.target.value}))} required />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Kanal (t.ex. Instagram/TikTok/YouTube/Webb)</Label>
              <Input value={form.channel} onChange={e=>setForm(f=>({...f, channel: e.target.value}))} placeholder="@dittkonto eller URL" />
            </div>
            <div>
              <Label>Följare</Label>
              <Input value={form.followers} onChange={e=>setForm(f=>({...f, followers: e.target.value}))} placeholder="t.ex. 25 000" />
            </div>
          </Row>
          <div>
            <Label>Övrigt</Label>
            <Textarea value={form.notes} onChange={e=>setForm(f=>({...f, notes: e.target.value}))} placeholder="Berätta kort hur du vill promota Elchef" />
          </div>
          {ref && <Small>Din ref-kod hittades: <b>{ref}</b></Small>}
          {campaign && <Small>Din kampanjkod hittades: <b>{campaign}</b></Small>}
          <Button type="submit" disabled={status==='sending'}>
            {status==='sending' ? 'Skickar...' : 'Skicka ansökan'}
          </Button>
          {status==='success' && <Small>✅ Tack! Vi återkommer inom kort.</Small>}
          {status==='error' && <Small>❌ Något gick fel. Försök igen.</Small>}
        </Form>
        )}

        {activeTab === 'company' && (
        <>
        <Prose>
          <p><b>Är ni ett elhandelsbolag eller strömsällskap som vill växa?</b> Elchef hjälper hushåll att hitta rätt elavtal på ett enkelt och transparent sätt. Vi samarbetar med utvalda leverantörer som erbjuder schyssta villkor och konkurrenskraftiga priser – utan dolda avgifter.</p>
          <p><b>Så fungerar partnerskapet:</b></p>
          <ul>
            <li>Vi presenterar era aktuella erbjudanden på Elchef.se där de passar kundens behov.</li>
            <li>Ni får kvalificerade leads och avslut från kunder som redan förstått ert erbjudande.</li>
            <li>Spårning sker via ref-länk och kampanjkod med 30 dagars attribuering.</li>
            <li>Ni får regelbunden återkoppling och kan enkelt uppdatera kampanjer.</li>
          </ul>
          <p><b>Vad vi letar efter:</b> Tydliga avtal, rimliga påslag, transparent prissättning och möjlighet till kampanjer som skapar verkligt kundvärde.</p>
        </Prose>
        <Form onSubmit={onSubmitCompany}>
          <Row>
            <div>
              <Label>Företagsnamn</Label>
              <Input value={companyForm.companyName} onChange={e=>setCompanyForm(f=>({...f, companyName: e.target.value}))} required />
            </div>
            <div>
              <Label>Organisationsnummer</Label>
              <Input value={companyForm.orgNumber} onChange={e=>setCompanyForm(f=>({...f, orgNumber: e.target.value}))} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Kontaktperson</Label>
              <Input value={companyForm.contactName} onChange={e=>setCompanyForm(f=>({...f, contactName: e.target.value}))} required />
            </div>
            <div>
              <Label>E-post</Label>
              <Input type="email" value={companyForm.email} onChange={e=>setCompanyForm(f=>({...f, email: e.target.value}))} required />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Telefon</Label>
              <Input value={companyForm.phone} onChange={e=>setCompanyForm(f=>({...f, phone: e.target.value}))} />
            </div>
            <div>
              <Label>Webbplats</Label>
              <Input value={companyForm.website} onChange={e=>setCompanyForm(f=>({...f, website: e.target.value}))} placeholder="https://..." />
            </div>
          </Row>
          
          <div>
            <Label>Övrigt</Label>
            <Textarea value={companyForm.notes} onChange={e=>setCompanyForm(f=>({...f, notes: e.target.value}))} placeholder="Beskriv kort hur du vill samarbeta" />
          </div>
          {ref && <Small>Ref-kod: <b>{ref}</b></Small>}
          {campaign && <Small>Kampanjkod: <b>{campaign}</b></Small>}
          <Button type="submit" disabled={companyStatus==='sending'}>
            {companyStatus==='sending' ? 'Skickar...' : 'Skicka ansökan'}
          </Button>
          {companyStatus==='success' && <Small>✅ Tack! Vi återkommer inom kort.</Small>}
          {companyStatus==='error' && <Small>❌ Något gick fel. Försök igen.</Small>}
        </Form>
        </>
        )}
      </Container>
    </Section>
  );
}


