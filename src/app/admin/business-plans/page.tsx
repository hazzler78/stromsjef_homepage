"use client";

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

type PriceZone = 'ALL' | 'NO1' | 'NO2' | 'NO3' | 'NO4' | 'NO5';

type Plan = {
  id: string;
  supplier_name: string;
  plan_name: string;
  price_per_kwh: number;
  monthly_fee: number;
  binding_time: number;
  binding_time_text?: string | null;
  terms_guarantee?: string | null;
  guarantee_disclaimer?: string | null;
  termination_fee?: number | null;
  price_zone: PriceZone;
  logo_url?: string | null;
  affiliate_link?: string | null;
  featured: boolean;
  sort_order?: number | null;
  price_badge?: string | null;
  recommended: boolean;
  created_at?: string;
  updated_at?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const getSupabase = () => createClient(SUPABASE_URL as string, SUPABASE_ANON as string);


const Container = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 24px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
`;

export default function AdminBusinessPlans() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Plan | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('business_electricity_plans')
        .select('*');
      if (error) throw error;
      // Sort in JavaScript to handle nulls properly
      const sorted = (data as Plan[]).sort((a, b) => {
        const sortA = a.sort_order ?? Number.POSITIVE_INFINITY;
        const sortB = b.sort_order ?? Number.POSITIVE_INFINITY;
        if (sortA !== sortB) return sortA - sortB;
        
        const bindDiff = (a.binding_time || 0) - (b.binding_time || 0);
        if (bindDiff !== 0) return bindDiff;
        
        const priceA = a.price_per_kwh || Number.POSITIVE_INFINITY;
        const priceB = b.price_per_kwh || Number.POSITIVE_INFINITY;
        if (priceA !== priceB) return priceA - priceB;
        
        return a.supplier_name.localeCompare(b.supplier_name);
      });
      setItems(sorted);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(p =>
      p.id.toLowerCase().includes(q) ||
      (p.supplier_name || '').toLowerCase().includes(q) ||
      (p.plan_name || '').toLowerCase().includes(q) ||
      (p.price_zone || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  function newPlan(): Plan {
    return {
      id: '',
      supplier_name: '',
      plan_name: '',
      price_per_kwh: 0,
      monthly_fee: 0,
      binding_time: 0,
      price_zone: 'NO1',
      featured: false,
      recommended: false,
      logo_url: '/logos/placeholder.png'
    } as Plan;
  }

  async function save(plan: Plan) {
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const row = {
        ...plan,
        id: plan.id.trim(),
      } as Plan;
      if (!row.id) throw new Error('ID krävs');
      if (items.find(p => p.id === row.id)) {
        const { error } = await supabase.from('business_electricity_plans').update(row).eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_electricity_plans').insert([row]);
        if (error) throw error;
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Radera detta avtal?')) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('business_electricity_plans').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      await load();
    }
  }

  async function toggleRecommend(id: string, value: boolean) {
    const supabase = getSupabase();
    const { error } = await supabase.from('business_electricity_plans').update({ recommended: value }).eq('id', id);
    if (!error) await load();
  }

  if (!authed) {
    return (
      <Container>
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Admininloggning</h2>
        <p style={{ marginBottom: 8, textAlign: 'center' }}>Logga in via huvudpanelen först.</p>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h1 style={{ marginBottom: 8 }}>⚡ Bedriftsavtal – leverantörer</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#6b7280' }}>
          Hantera leverantörer för `business_electricity_plans`.
        </p>

        <Toolbar>
          <input
            placeholder="Sök..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}
          />
          <button style={{ padding: '8px 12px' }} onClick={() => setEditing(newPlan())}>Ny plan</button>
        </Toolbar>

        {loading && <div>Laddar…</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {!loading && (
          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 8, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#9ca3af', minWidth: 40 }}>
                  {p.sort_order ?? '—'}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.supplier_name} · {p.plan_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{p.price_zone} · {p.price_per_kwh} øre/kWh · {p.monthly_fee} kr/mnd</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={!!p.recommended} onChange={(e) => toggleRecommend(p.id, e.target.checked)} /> Rek.
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(p)}>Redigera</button>
                  <button onClick={() => remove(p.id)} style={{ color: '#b91c1c' }}>Radera</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div>Inga resultat.</div>}
          </div>
        )}

        {editing && (
          <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>Redigera plan</h3>
            
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Grundläggande information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>ID (unik identifierare)</label>
                  <input placeholder="t.ex. vstrom-bedrift-2024" value={editing.id} onChange={e => setEditing({ ...editing, id: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Sorteringsordning (1=först)</label>
                  <input type="number" step="1" placeholder="1, 2, 3..." value={editing.sort_order ?? ''} onChange={e => setEditing({ ...editing, sort_order: e.target.value ? Number(e.target.value) : null })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Leverantör</label>
                  <input placeholder="t.ex. V-strom" value={editing.supplier_name || ''} onChange={e => setEditing({ ...editing, supplier_name: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Plan namn</label>
                  <input placeholder="t.ex. Renspott Bedrift" value={editing.plan_name || ''} onChange={e => setEditing({ ...editing, plan_name: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Prisområde</label>
                  <select value={editing.price_zone} onChange={e => setEditing({ ...editing, price_zone: e.target.value as PriceZone })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}>
                    {(['ALL','NO1','NO2','NO3','NO4','NO5'] as PriceZone[]).map(z => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Priser och avgifter</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Pris per kWh (øre)</label>
                  <input type="number" step="0.01" placeholder="49.90" value={editing.price_per_kwh ?? 0} onChange={e => setEditing({ ...editing, price_per_kwh: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Månadsavgift (kr)</label>
                  <input type="number" step="1" placeholder="0" value={editing.monthly_fee ?? 0} onChange={e => setEditing({ ...editing, monthly_fee: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Bindingstid (månader)</label>
                  <input type="number" step="1" placeholder="0" value={editing.binding_time ?? 0} onChange={e => setEditing({ ...editing, binding_time: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Bruddgebyr (kr)</label>
                  <input type="number" step="1" placeholder="0" value={editing.termination_fee ?? 0} onChange={e => setEditing({ ...editing, termination_fee: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Länkar och media</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Logo URL</label>
                  <input placeholder="/logos/vstrom.png" value={editing.logo_url || ''} onChange={e => setEditing({ ...editing, logo_url: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Affiliate-länk</label>
                  <input placeholder="https://example.com/affiliate" value={editing.affiliate_link || ''} onChange={e => setEditing({ ...editing, affiliate_link: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Text och beskrivningar</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Pris-badge (text över pris)</label>
                  <input placeholder="t.ex. Kampanje" value={editing.price_badge || ''} onChange={e => setEditing({ ...editing, price_badge: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Bindingstid text</label>
                  <input placeholder="t.ex. Ingen bindingstid" value={editing.binding_time_text || ''} onChange={e => setEditing({ ...editing, binding_time_text: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Villkorsgaranti</label>
                  <input placeholder="t.ex. 12 månaders prisgaranti" value={editing.terms_guarantee || ''} onChange={e => setEditing({ ...editing, terms_guarantee: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Ansvarsfriskrivning</label>
                  <input placeholder="t.ex. Gäller endast för nya kunder" value={editing.guarantee_disclaimer || ''} onChange={e => setEditing({ ...editing, guarantee_disclaimer: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Inställningar</h4>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={!!editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} />
                  <span style={{ fontSize: '14px' }}>Utvald (visas först)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={!!editing.recommended} onChange={e => setEditing({ ...editing, recommended: e.target.checked })} />
                  <span style={{ fontSize: '14px' }}>Rekommenderad (grön badge)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => editing && save(editing)} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{saving ? 'Sparar…' : 'Spara'}</button>
              <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Avbryt</button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}


