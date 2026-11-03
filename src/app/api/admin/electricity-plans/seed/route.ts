import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { mockElectricityPlans } from '@/lib/electricity';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const rows = mockElectricityPlans.map((p) => ({
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

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('electricity_plans').upsert(rows, { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
