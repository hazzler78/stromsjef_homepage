"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { mockElectricityPlans } from '@/lib/electricity';

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

export default function SeedPlans() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const supabase = getSupabase();
      const rows = mockElectricityPlans.map(p => ({
        id: p.id,
        supplier_name: p.supplierName,
        plan_name: p.planName,
        price_per_kwh: p.pricePerKwh,
        monthly_fee: p.monthlyFee,
        binding_time: p.bindingTime,
        binding_time_text: p.bindingTimeText || null,
        terms_guarantee: p.termsGuarantee || null,
        guarantee_disclaimer: p.guaranteeDisclaimer || null,
        termination_fee: p.terminationFee ?? null,
        price_zone: p.priceZone,
        logo_url: p.logoUrl || null,
        affiliate_link: p.affiliateLink || null,
        featured: !!p.featured,
        sort_order: p.sortOrder ?? null,
        recommended: !!p.featured,
      }));
      const { error } = await supabase
        .from('electricity_plans')
        .upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      setResult(`Importerad ${rows.length} planer`);
    } catch (e) {
      setResult('Fel: ' + (e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={run} disabled={running}>{running ? 'Importerar…' : 'Importera mock-planer'}</button>
      {result && <div style={{ marginTop: 8 }}>{result}</div>}
    </div>
  );
}


