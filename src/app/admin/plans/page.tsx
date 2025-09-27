"use client";

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import styled from 'styled-components';

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

const getSupabase = () =>
  createClient(
    SUPABASE_URL as string,
    SUPABASE_ANON as string
  );

const ADMIN_PASSWORD = "grodan2025";

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

export default function AdminPlans() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Plan | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('electricity_plans')
        .select('*')
        .order('price_zone')
        .order('sort_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setItems(data as Plan[]);
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
        const { error } = await supabase.from('electricity_plans').update(row).eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('electricity_plans').insert([row]);
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
    const { error } = await supabase.from('electricity_plans').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      await load();
    }
  }

  async function toggleRecommend(id: string, value: boolean) {
    const supabase = getSupabase();
    const { error } = await supabase.from('electricity_plans').update({ recommended: value }).eq('id', id);
    if (!error) await load();
  }

  if (!authed) {
    return (
      <Container>
        <h1>Admin – Avtal</h1>
        <p>Ange adminlösenord:</p>
        <input type="password" placeholder="Lösenord" onKeyDown={(e) => {
          if (e.key === 'Enter') setAuthed((e.target as HTMLInputElement).value === ADMIN_PASSWORD);
        }} />
        <button onClick={() => {
          const el = document.querySelector('input[type="password"]') as HTMLInputElement | null;
          setAuthed((el?.value || '') === ADMIN_PASSWORD);
        }}>Logga in</button>
        {(!SUPABASE_URL || !SUPABASE_ANON) && (
          <div style={{ marginTop: 12, color: '#b91c1c' }}>
            Saknar Supabase-konfiguration. Lägg till i .env.local och starta om dev-servern:
            <pre style={{ background: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 8 }}>{`NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`}</pre>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <h1 style={{ color: 'white' }}>Elavtal (Admin)</h1>
      <Toolbar>
        <input
          placeholder="Sök (leverantör, plan, zon, id)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button onClick={() => setEditing(newPlan())}>Nytt avtale</button>
        <button onClick={load} disabled={loading}>{loading ? 'Laster…' : 'Oppdater'}</button>
      </Toolbar>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {editing && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff' }}>
          <h3>{items.find(i => i.id === editing.id) ? 'Rediger avtale' : 'Nytt avtale'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>ID<input value={editing.id} onChange={e => setEditing({ ...editing, id: e.target.value })} /></label>
            <label>Zon
              <select value={editing.price_zone} onChange={e => setEditing({ ...editing, price_zone: e.target.value as PriceZone })}>
                <option value="ALL">ALL</option>
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
              </select>
            </label>
            <label>Leverantör<input value={editing.supplier_name} onChange={e => setEditing({ ...editing, supplier_name: e.target.value })} /></label>
            <label>Plan<input value={editing.plan_name} onChange={e => setEditing({ ...editing, plan_name: e.target.value })} /></label>
            <label>Pris (øre/kWh)<input type="number" step="0.01" value={editing.price_per_kwh} onChange={e => setEditing({ ...editing, price_per_kwh: Number(e.target.value) })} /></label>
            <label>Månadsavgift<input type="number" step="0.01" value={editing.monthly_fee} onChange={e => setEditing({ ...editing, monthly_fee: Number(e.target.value) })} /></label>
            <label>Bindingstid (mån)<input type="number" value={editing.binding_time} onChange={e => setEditing({ ...editing, binding_time: Number(e.target.value) })} /></label>
            <label>Bindingstid (text)<input value={editing.binding_time_text || ''} onChange={e => setEditing({ ...editing, binding_time_text: e.target.value })} /></label>
            <label>Vilkårsgaranti<input value={editing.terms_guarantee || ''} onChange={e => setEditing({ ...editing, terms_guarantee: e.target.value })} /></label>
            <label>Disclaimer<textarea value={editing.guarantee_disclaimer || ''} onChange={e => setEditing({ ...editing, guarantee_disclaimer: e.target.value })} /></label>
            <label>Bruddavgift<input type="number" step="0.01" value={editing.termination_fee || 0} onChange={e => setEditing({ ...editing, termination_fee: Number(e.target.value) })} /></label>
            <label>Logo URL<input value={editing.logo_url || ''} onChange={e => setEditing({ ...editing, logo_url: e.target.value })} placeholder="/logos/cheap-energy.png" /></label>
            <label>Affiliate URL<input value={editing.affiliate_link || ''} onChange={e => setEditing({ ...editing, affiliate_link: e.target.value })} /></label>
            <label>Pris-badge (svart fet tekst over pris)<input value={editing.price_badge || ''} onChange={e => setEditing({ ...editing, price_badge: e.target.value })} placeholder="Kampanje" /></label>
            <label>Sortering<input type="number" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} /> Utvald
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={editing.recommended} onChange={e => setEditing({ ...editing, recommended: e.target.checked })} /> Rekommenderad
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => save(editing)} disabled={saving}>{saving ? 'Lagrer…' : 'Lagre'}</button>
            <button onClick={() => setEditing(null)} disabled={saving}>Avbryt</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', alignItems: 'center', gap: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
            <img src={p.logo_url || '/favicon.svg'} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700 }}>{p.supplier_name} · {p.plan_name} <span style={{ color: '#64748b' }}>({p.price_zone})</span></div>
              <div style={{ color: '#475569', fontSize: 14 }}>{p.price_per_kwh} øre/kWh · {p.monthly_fee} kr/mån · {p.binding_time > 0 ? `${p.binding_time} mån bindingstid` : 'Ingen bindingstid'}</div>
              {p.price_badge && <div style={{ fontWeight: 800, color: '#111827', marginTop: 4 }}>{p.price_badge}</div>}
              {p.terms_guarantee && <div style={{ color: '#64748b', fontSize: 12 }}>{p.terms_guarantee}</div>}
              {p.guarantee_disclaimer && <div style={{ color: '#94a3b8', fontSize: 12 }}>{p.guarantee_disclaimer}</div>}
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={p.recommended} onChange={e => toggleRecommend(p.id, e.target.checked)} /> Rek.
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(p)}>Rediger</button>
              <button onClick={() => remove(p.id)} style={{ color: '#b91c1c' }}>Slett</button>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}


